import { BadRequestException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PDFParse } from 'pdf-parse';
import { PrismaService } from './prisma.service';
import { parseBudgetText } from './budget.parser';

const OFFICIAL_BUDGET_PAGE = 'https://www.chaurpatimun.gov.np/budget-program';
const OFFICIAL_HOSTS = new Set(['chaurpatimun.gov.np', 'www.chaurpatimun.gov.np']);
const SCAN_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MAX_DOCUMENTS_PER_SCAN = 8;
const MAX_PDF_BYTES = 35 * 1024 * 1024;

type DiscoveredPdf = { title: string; sourceUrl: string; fiscalYear: string };

function decodeEntities(value: string) {
  return value.replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_match, digits: string) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([\da-f]+);/gi, (_match, digits: string) => String.fromCodePoint(parseInt(digits, 16)));
}

function plainText(value: string) {
  return decodeEntities(value.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ').trim();
}

function numericYear(value: string) {
  const match = value.match(/^(20\d{2})\/(\d{2})$/);
  return match ? Number(match[1]) * 100 + Number(match[2]) : 0;
}

function discoverBudgetPdfs(html: string, pageUrl = OFFICIAL_BUDGET_PAGE): DiscoveredPdf[] {
  const headings = [...html.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi)];
  const links = /<a\b([^>]*?)href\s*=\s*(["'])(.*?)\2([^>]*)>([\s\S]*?)<\/a>/gi;
  const records = new Map<string, DiscoveredPdf>();
  for (const match of html.matchAll(links)) {
    const href = decodeEntities(match[3]).trim();
    if (!/\.pdf(?:[?#]|$)/i.test(href)) continue;
    let url: URL;
    try { url = new URL(href, pageUrl); } catch { continue; }
    if (!OFFICIAL_HOSTS.has(url.hostname.toLowerCase())) continue;
    const index = match.index ?? 0;
    const heading = [...headings].reverse().find((item) => (item.index ?? -1) < index);
    const linkTitle = plainText(match[5]);
    const title = plainText(heading?.[1] ?? '') || linkTitle || decodeURIComponent(url.pathname.split('/').pop() ?? 'Official budget PDF');
    const clues = `${title} ${linkTitle} ${url.pathname}`;
    if (!/(?:बजेट|आयव्यय|आय\s*व्यय|red\s*book|budget|वार्षिक\s*(?:बजेट|कार्यक्रम)|विकास\s*कार्यक्रम)/i.test(clues)) continue;
    if (/(?:नीति\s*तथा\s*कार्यक्रम|policy\s*(?:and|&)\s*program)/i.test(clues) && !/(?:red\s*book|बजेट)/i.test(linkTitle)) continue;
    const yearText = `${title} ${linkTitle} ${decodeURIComponent(url.pathname)}`;
    const yearMatch = yearText.match(/(20\d{2})\s*[/.\-]\s*(\d{2,4})/);
    if (!yearMatch) continue;
    const fiscalYear = `${yearMatch[1]}/${yearMatch[2].slice(-2)}`;
    records.set(url.toString(), { title: title.slice(0, 300), sourceUrl: url.toString(), fiscalYear });
  }
  return [...records.values()].sort((a, b) => numericYear(b.fiscalYear) - numericYear(a.fiscalYear)).slice(0, MAX_DOCUMENTS_PER_SCAN);
}

@Injectable()
export class BudgetService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BudgetService.name);
  private timer?: NodeJS.Timeout;
  private scanning = false;
  private scanStartedAt: Date | null = null;
  private scanFinishedAt: Date | null = null;
  private scanError: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    if (process.env.BUDGET_AUTO_SCAN === 'false') return;
    const firstScan = setTimeout(() => { void this.scanOfficialSource().catch((error) => this.logger.error(error)); }, 2500);
    firstScan.unref();
    this.timer = setInterval(() => { void this.scanOfficialSource().catch((error) => this.logger.error(error)); }, SCAN_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async publicYears() {
    const docs = await this.prisma.budgetSourceDocument.findMany({
      where: { status: 'READY' }, select: { fiscalYear: true, title: true, checkedAt: true, totalNpr: true, sourceUrl: true },
      orderBy: [{ fiscalYear: 'desc' }, { checkedAt: 'desc' }],
    });
    const unique = new Map<string, typeof docs[number]>();
    for (const document of docs) if (!unique.has(document.fiscalYear)) unique.set(document.fiscalYear, document);
    return [...unique.values()].map((doc) => ({ fiscalYear: doc.fiscalYear, title: doc.title, lastCheckedAt: doc.checkedAt, totalNpr: doc.totalNpr, sourceUrl: doc.sourceUrl }));
  }

  async publicBudget(fiscalYear?: string) {
    const selectedYear = fiscalYear?.trim();
    const doc = await this.prisma.budgetSourceDocument.findFirst({
      where: { status: 'READY', ...(selectedYear ? { fiscalYear: selectedYear } : {}) },
      orderBy: [{ fiscalYear: 'desc' }, { checkedAt: 'desc' }],
      include: { allocations: { orderBy: [{ wardNumber: 'asc' }, { sector: 'asc' }, { rowNumber: 'asc' }] } },
    });
    if (!doc) return { document: null, years: await this.publicYears(), totalNpr: 0, projectCount: 0, wards: [], sectors: [], projects: [] };
    const sum = (rows: Array<{ amountNpr: number }>) => rows.reduce((total, row) => total + row.amountNpr, 0);
    const grouped = new Map<string, typeof doc.allocations>();
    for (const allocation of doc.allocations) {
      const current = grouped.get(allocation.sectorKey) ?? [];
      current.push(allocation);
      grouped.set(allocation.sectorKey, current);
    }
    const sectors = [...grouped.entries()].map(([sectorKey, rows]) => ({ sectorKey, sector: rows[0].sector, totalNpr: sum(rows), projectCount: rows.length }))
      .sort((a, b) => b.totalNpr - a.totalNpr);
    const wardGroups = new Map<number | null, typeof doc.allocations>();
    for (const allocation of doc.allocations) {
      const current = wardGroups.get(allocation.wardNumber) ?? [];
      current.push(allocation);
      wardGroups.set(allocation.wardNumber, current);
    }
    const wards = [...wardGroups.entries()].map(([wardNumber, rows]) => ({ wardNumber, label: wardNumber === null ? 'Municipality-wide / not assigned to a ward' : `Ward ${wardNumber}`, totalNpr: sum(rows), projectCount: rows.length }))
      .sort((a, b) => a.wardNumber === null ? 1 : b.wardNumber === null ? -1 : a.wardNumber - b.wardNumber);
    return {
      document: { id: doc.id, title: doc.title, fiscalYear: doc.fiscalYear, sourceUrl: doc.sourceUrl, checkedAt: doc.checkedAt, importedAt: doc.importedAt, extractedRows: doc.extractedRows, validRows: doc.validRows },
      years: await this.publicYears(), totalNpr: sum(doc.allocations), projectCount: doc.allocations.length, wards, sectors,
      projects: doc.allocations.map(({ id, rowNumber, wardNumber, projectName, sector, sectorKey, expenditureHead, budgetCode, amountNpr, confidence }) => ({ id, rowNumber, wardNumber, projectName, sector, sectorKey, expenditureHead, budgetCode, amountNpr, confidence })),
    };
  }

  async adminStatus() {
    const documents = await this.prisma.budgetSourceDocument.findMany({ orderBy: [{ fiscalYear: 'desc' }, { checkedAt: 'desc' }] });
    return {
      scanning: this.scanning, scanStartedAt: this.scanStartedAt, scanFinishedAt: this.scanFinishedAt, scanError: this.scanError,
      sourcePage: OFFICIAL_BUDGET_PAGE,
      documents: documents.map((doc) => ({ ...doc, warnings: this.parseWarnings(doc.warningsJson) })),
    };
  }

  async scanOfficialSource() {
    if (this.scanning) return { skipped: true, reason: 'A budget scan is already running.' };
    this.scanning = true;
    this.scanStartedAt = new Date();
    this.scanError = null;
    try {
      const response = await fetch(OFFICIAL_BUDGET_PAGE, { headers: { 'User-Agent': 'ChaurpatiMunicipalBudgetDashboard/1.0', Accept: 'text/html' }, signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw new Error(`Official budget page returned HTTP ${response.status}.`);
      const html = await response.text();
      const sources = discoverBudgetPdfs(html);
      if (!sources.length) throw new Error('No official annual budget PDFs with a fiscal year were found on the source page.');
      const outcomes: Array<{ fiscalYear: string; title: string; status: string; rows: number; message?: string }> = [];
      for (const source of sources) {
        try { outcomes.push(await this.importPdf(source)); }
        catch (error) {
          const message = error instanceof Error ? error.message : 'PDF download or parsing failed.';
          const existing = await this.prisma.budgetSourceDocument.findUnique({ where: { sourceUrl: source.sourceUrl } });
          if (existing) await this.prisma.budgetSourceDocument.update({ where: { id: existing.id }, data: { checkedAt: new Date(), lastError: message } });
          outcomes.push({ fiscalYear: source.fiscalYear, title: source.title, status: existing?.status ?? 'FAILED', rows: existing?.validRows ?? 0, message });
          this.logger.warn(`Budget source ${source.fiscalYear} was not refreshed: ${message}`);
        }
      }
      this.scanFinishedAt = new Date();
      return { scannedAt: this.scanFinishedAt, outcomes };
    } catch (error) {
      this.scanError = error instanceof Error ? error.message : 'Official budget scan failed.';
      this.scanFinishedAt = new Date();
      this.logger.error(this.scanError);
      return { scannedAt: this.scanFinishedAt, error: this.scanError, outcomes: [] };
    } finally { this.scanning = false; }
  }

  async importUploadedPdf(bytes: Buffer, title: string, sourceUrl: string, fiscalYear?: string) {
    let url: URL;
    try { url = new URL(sourceUrl); } catch { throw new BadRequestException('Enter the direct URL of the official PDF.'); }
    if (!OFFICIAL_HOSTS.has(url.hostname.toLowerCase()) || !/\.pdf$/i.test(url.pathname)) {
      throw new BadRequestException('The PDF source must be a direct .pdf link hosted by the official Chaurpati municipality website.');
    }
    if (bytes.length < 8 || bytes.length > MAX_PDF_BYTES || bytes.subarray(0, 5).toString() !== '%PDF-') {
      throw new BadRequestException('Upload a valid PDF file smaller than 35 MB.');
    }
    const guessedYear = fiscalYear?.trim() || title.match(/20\d{2}\s*[/.-]\s*\d{2,4}/)?.[0] || '';
    const normalizedYear = guessedYear.replace(/\s/g, '').replace(/[.-]/g, '/').replace(/\/(\d{4})$/, (_match, year: string) => `/${year.slice(-2)}`);
    if (!/^20\d{2}\/\d{2}$/.test(normalizedYear)) throw new BadRequestException('Enter the fiscal year, for example 2082/83.');
    return this.importPdfBytes({ title: title.trim() || decodeURIComponent(url.pathname.split('/').pop() ?? 'Official budget PDF'), sourceUrl: url.toString(), fiscalYear: normalizedYear }, bytes);
  }

  private async importPdf(source: DiscoveredPdf) {
    const response = await fetch(source.sourceUrl, { headers: { 'User-Agent': 'ChaurpatiMunicipalBudgetDashboard/1.0', Accept: 'application/pdf' }, signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw new Error(`Official PDF returned HTTP ${response.status}.`);
    const declaredSize = Number(response.headers.get('content-length') ?? 0);
    if (declaredSize > MAX_PDF_BYTES) throw new Error('PDF exceeds the 35 MB automatic import limit.');
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 8 || bytes.length > MAX_PDF_BYTES || bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('The official link did not return a supported PDF file under 35 MB.');
    return this.importPdfBytes(source, bytes);
  }

  private async importPdfBytes(source: DiscoveredPdf, bytes: Buffer) {
    const fileHash = createHash('sha256').update(bytes).digest('hex');
    const existing = await this.prisma.budgetSourceDocument.findUnique({ where: { sourceUrl: source.sourceUrl } });
    if (existing?.fileHash === fileHash) {
      await this.prisma.budgetSourceDocument.update({ where: { id: existing.id }, data: { checkedAt: new Date(), lastError: null } });
      return { fiscalYear: source.fiscalYear, title: source.title, status: existing.status, rows: existing.validRows, message: 'Unchanged source PDF; existing extracted rows retained.' };
    }

    const parser = new PDFParse({ data: bytes });
    let extractedText: string;
    try { extractedText = (await parser.getText()).text; }
    finally { await parser.destroy(); }
    const parsed = parseBudgetText(extractedText, `${source.title} ${source.fiscalYear}`);
    const municipalityFound = /चौरपाटी|chaurpati/i.test(extractedText);
    const sectorCoverage = parsed.lines.length ? parsed.lines.filter((line) => line.sectorKey !== 'other').length / parsed.lines.length : 0;
    const ready = municipalityFound && parsed.lines.length >= 10 && sectorCoverage >= 0.5;
    const warnings = [...parsed.warnings];
    if (!municipalityFound) warnings.push('Automatic publication paused: municipality identity was not confirmed in the PDF text.');
    if (parsed.fiscalYear && parsed.fiscalYear !== source.fiscalYear) warnings.push(`Page fiscal year (${source.fiscalYear}) and PDF fiscal year (${parsed.fiscalYear}) differ.`);
    const fiscalYear = parsed.fiscalYear ?? source.fiscalYear;
    if (existing?.status === 'READY' && !ready) {
      const warningText = [...warnings, 'Previously published allocations were retained because this update did not pass automatic validation.'].join(' ');
      await this.prisma.budgetSourceDocument.update({ where: { id: existing.id }, data: { checkedAt: new Date(), lastError: warningText, warningsJson: JSON.stringify(warnings) } });
      return { fiscalYear: existing.fiscalYear, title: existing.title, status: existing.status, rows: existing.validRows, message: warningText };
    }
    const totalNpr = parsed.lines.reduce((sum, row) => sum + row.amountNpr, 0);
    const data = {
      title: source.title, fiscalYear, fileHash, status: ready ? 'READY' : 'NEEDS_REVIEW', checkedAt: new Date(), importedAt: new Date(),
      totalNpr, extractedRows: parsed.lines.length, validRows: parsed.lines.filter((line) => line.amountNpr >= 0).length,
      warningsJson: JSON.stringify(warnings), lastError: null,
    };
    const document = await this.prisma.$transaction(async (tx) => {
      const saved = existing
        ? await tx.budgetSourceDocument.update({ where: { id: existing.id }, data })
        : await tx.budgetSourceDocument.create({ data: { ...data, sourceUrl: source.sourceUrl } });
      await tx.budgetAllocation.deleteMany({ where: { sourceDocumentId: saved.id } });
      if (parsed.lines.length) await tx.budgetAllocation.createMany({ data: parsed.lines.map((line) => ({ ...line, sourceDocumentId: saved.id, fiscalYear })) });
      return saved;
    });
    return { fiscalYear: document.fiscalYear, title: document.title, status: document.status, rows: document.validRows, message: warnings.join(' ') || undefined };
  }

  private parseWarnings(json: string) {
    try { const data = JSON.parse(json); return Array.isArray(data) ? data.map(String) : []; }
    catch { return ['Stored parser notes could not be read.']; }
  }
}

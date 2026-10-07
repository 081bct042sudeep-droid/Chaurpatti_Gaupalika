export type BudgetLine = {
  rowNumber: number | null;
  wardNumber: number | null;
  projectName: string;
  sector: string;
  sectorKey: string;
  expenditureHead: string | null;
  budgetCode: string | null;
  amountNpr: number;
  rawAmount: string;
  rawRow: string;
  confidence: number;
};

export type ParsedBudget = {
  fiscalYear: string | null;
  amountMultiplier: number;
  lines: BudgetLine[];
  warnings: string[];
};

export function normalizeNepaliDigits(value: string) {
  const nepali = '०१२३४५६७८९';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  return [...value].map((character) => {
    const index = nepali.indexOf(character);
    if (index >= 0) return String(index);
    const arabicIndex = arabic.indexOf(character);
    return arabicIndex >= 0 ? String(arabicIndex) : character;
  }).join('');
}

export function normalizeFiscalYear(value: string) {
  const text = normalizeNepaliDigits(value).replace(/[।॥]/g, '/');
  const match = text.match(/(?:आ\.?\s*व\.?\s*[:.]?\s*)?(20\d{2})\s*[/.\-]\s*(\d{2,4})/i);
  return match ? `${match[1]}/${match[2].slice(-2)}` : null;
}

const sectorRules: Array<[string, string, RegExp]> = [
  ['employee-compensation', 'Employee salary & benefits', /पारिश्रमिक|तलब|कर्मचारी|निवृतभरण|उपदान|बीमा कोष|कर्मचारी कल्याण|employee|salary|remuneration/i],
  ['education', 'Education', /शिक्षा|विद्यालय|शैक्षिक|क्याम्पस|education|school/i],
  ['health', 'Health', /स्वास्थ्य|अस्पताल|औषधि|आयुर्वेद|खोप|health|hospital|medicine/i],
  ['infrastructure', 'Infrastructure & roads', /पूर्वाधार|सडक|पुल|भवन|निर्माण|सिँचाइ|सिंचाइ|खानेपानी|infrastructure|road|bridge|construction/i],
  ['agriculture', 'Agriculture & livestock', /कृषि|पशुपन्छी|पशुसेवा|किसान|बीउ|बिउ|agriculture|livestock/i],
  ['social-protection', 'Social protection & inclusion', /सामाजिक सुरक्षा|दलित|महिला|बालबालिका|जेष्ठ नागरिक|अपाङ्ग|समावेशी|social protection|inclusion/i],
  ['water-sanitation', 'Water & sanitation', /खानेपानी|सरसफाइ|ढल|फोहोर|water|sanitation/i],
  ['tourism-culture', 'Tourism, culture & heritage', /पर्यटन|संस्कृति|सम्पदा|मन्दिर|कला|tourism|culture|heritage/i],
  ['governance', 'Governance & administration', /कार्यालय सञ्चालन|प्रशासनिक|पदाधिकारी|बैठक|अनुगमन|सेवा प्रवाह|administration|governance/i],
  ['sports-youth', 'Sports & youth', /खेलकुद|युवा|रनिङ शिल्ड|sports|youth/i],
  ['environment-disaster', 'Environment & disaster response', /वातावरण|वन|विपद|विपत|जलवायु|environment|disaster/i],
];

function classifySector(text: string) {
  for (const [key, label, pattern] of sectorRules) {
    if (pattern.test(text)) return { sectorKey: key, sector: label };
  }
  return { sectorKey: 'other', sector: 'Other / unclassified' };
}

function parseMoneyTokens(line: string) {
  const normalized = normalizeNepaliDigits(line).replace(/[٬،]/g, ',');
  const matches = normalized.match(/(?<![\w])\d[\d,]*(?:\.\d{1,2})?(?!\w)/g) ?? [];
  return matches.map((raw) => ({ raw, amount: Number(raw.replace(/,/g, '')) })).filter((item) => Number.isFinite(item.amount));
}

function rowStart(line: string) {
  const match = normalizeNepaliDigits(line).match(/^\s*(\d{1,4})\s+(.+)$/);
  return match ? { number: Number(match[1]), firstText: match[2] } : null;
}

function wardIn(text: string) {
  const normalized = normalizeNepaliDigits(text).replace(/\s+/g, ' ');
  const match = normalized.match(/(?:वडा\s*(?:नं\.?|नम्बर)?\s*|ward\s*(?:no\.?\s*)?)([1-7])\b/i);
  return match ? Number(match[1]) : null;
}

function parseProject(block: string[], wardNumber: number | null, multiplier: number): BudgetLine | null {
  if (!block.length) return null;
  const first = rowStart(block[0]);
  if (!first) return null;
  const lines = [first.firstText, ...block.slice(1)].map((line) => line.trim()).filter(Boolean);
  const flattened = normalizeNepaliDigits(lines.join(' ')).replace(/\s+/g, ' ').trim();
  const codeMatch = flattened.match(/(?<!\d)\d{5}(?!\d)/);
  if (!codeMatch || codeMatch.index === undefined) return null;
  const code = codeMatch[0];
  const projectName = flattened.slice(0, codeMatch.index).replace(/\s+/g, ' ').trim().slice(0, 500);
  if (projectName.length < 2) return null;
  const amounts = block.flatMap(parseMoneyTokens);
  if (!amounts.length) return null;
  const finalAmount = amounts[amounts.length - 1];
  const amountNpr = Math.round(finalAmount.amount * multiplier * 100) / 100;
  if (!Number.isFinite(amountNpr) || amountNpr < 0 || amountNpr > 1e14) return null;
  const expenditureHead = flattened.slice(codeMatch.index + code.length).replace(/\s+/g, ' ').trim();
  const { sector, sectorKey } = classifySector(`${projectName} ${expenditureHead}`);
  const rawRow = block.join(' ').replace(/\s+/g, ' ').trim().slice(0, 4000);
  return {
    rowNumber: first.number,
    wardNumber: wardNumber ?? wardIn(projectName),
    projectName,
    sector,
    sectorKey,
    expenditureHead: expenditureHead.slice(0, 500) || null,
    budgetCode: code,
    amountNpr,
    rawAmount: finalAmount.raw,
    rawRow,
    confidence: sectorKey === 'other' ? 0.6 : 0.82,
  };
}

export function parseBudgetText(input: string, title = ''): ParsedBudget {
  const text = normalizeNepaliDigits(input).replace(/\r/g, '').replace(/[\u00a0\t]+/g, ' ');
  const allText = `${title}\n${text}`;
  const fiscalYear = normalizeFiscalYear(allText);
  const amountMultiplier = /(?:रु\.?\s*)?हजारमा|in\s+thousands?/i.test(text) ? 1000
    : /(?:रु\.?\s*)?लाखमा|in\s+lakhs?/i.test(text) ? 100_000
      : /(?:रु\.?\s*)?करोडमा|in\s+crores?/i.test(text) ? 10_000_000 : 1;
  const rows: BudgetLine[] = [];
  let current: string[] = [];
  let currentWard: number | null = null;
  let expectedNumber: number | null = null;
  const lines = text.split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const finish = () => {
    const parsed = parseProject(current, currentWard, amountMultiplier);
    if (parsed) rows.push(parsed);
    current = [];
  };
  for (const line of lines) {
    const newWard = wardIn(line);
    if (newWard !== null && /चौरपाटी|गाउँपालिका|नगरपालिका|वडा/i.test(line)) currentWard = newWard;
    const possibleCode = normalizeNepaliDigits(line).replace(/\s/g, '');
    if (/^\d{11,}$/.test(possibleCode) && /चौरपाटी|गाउँपालिका/i.test(line)) {
      const explicitWard = wardIn(line);
      if (explicitWard !== null) currentWard = explicitWard;
    }
    const start = rowStart(line);
    const isNext = start && (start.number === 1 || (expectedNumber !== null && start.number === expectedNumber));
    if (isNext) {
      finish();
      current = [line];
      expectedNumber = start!.number + 1;
      continue;
    }
    if (current.length) current.push(line);
  }
  finish();
  const unique = new Map<string, BudgetLine>();
  for (const row of rows) {
    const key = `${row.wardNumber ?? 'municipal'}:${row.budgetCode}:${row.projectName}:${row.amountNpr}`;
    if (!unique.has(key)) unique.set(key, row);
  }
  const parsedRows = [...unique.values()];
  const warnings: string[] = [];
  if (!fiscalYear) warnings.push('Fiscal year could not be identified from the PDF text or title.');
  if (!/चौरपाटी|chaurpati/i.test(allText)) warnings.push('The PDF text did not identify Chaurpati Municipality.');
  if (parsedRows.length < 10) warnings.push('Fewer than 10 complete budget rows were extracted.');
  if (parsedRows.filter((row) => row.sectorKey !== 'other').length < parsedRows.length * 0.5) warnings.push('Sector classification coverage is below 50%.');
  return { fiscalYear, amountMultiplier, lines: parsedRows, warnings };
}

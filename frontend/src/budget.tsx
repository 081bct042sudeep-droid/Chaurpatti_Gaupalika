import { useEffect, useState } from 'react'
import './budget.css'
import { useLanguage } from './language'

type BudgetLine = { id: string; wardNumber: number | null; projectName: string; sector: string; sectorKey: string; expenditureHead: string | null; budgetCode: string | null; amountNpr: number }
type BudgetYear = { fiscalYear: string; title: string; sourceUrl: string }
type BudgetData = { document: { title: string; fiscalYear: string; sourceUrl: string; checkedAt: string } | null; years: BudgetYear[]; totalNpr: number; projectCount: number; wards: Array<{ wardNumber: number | null; label: string; totalNpr: number; projectCount: number }>; sectors: Array<{ sectorKey: string; sector: string; totalNpr: number; projectCount: number }>; projects: BudgetLine[] }
type AdminData = { scanError: string | null; scanFinishedAt: string | null; scanning: boolean; sourcePage: string; documents: Array<{ id: string; title: string; fiscalYear: string; sourceUrl: string; status: string; validRows: number; extractedRows: number; lastError: string | null; warnings: string[] }> }

const officialArchive = 'https://www.chaurpatimun.gov.np/budget-program'
const sourceDocuments = [
  { year: '2082/83', title: 'Red Book 2082/83', kind: 'Annual allocation detail', file: '/budget-documents/red-book-2082-83.pdf', source: 'https://chaurpatimun.gov.np/sites/chaurpatimun.gov.np/files/Red%20Book%202082-83.pdf' },
  { year: '2081/82', title: 'Policy and Program 2081/82', kind: 'Policy and program', file: '/budget-documents/policy-program-2081-82.pdf', source: 'https://www.chaurpatimun.gov.np/sites/chaurpatimun.gov.np/files/%E0%A4%86.%E0%A4%B5.%20%E0%A5%A8%E0%A5%A6%E0%A5%AE%E0%A5%A7-%E0%A5%AE%E0%A5%A2%20%E0%A4%95%E0%A5%8B%20%E0%A4%AB%E0%A4%BE%E0%A4%87%E0%A4%A8%E0%A4%B2%20%E0%A4%A8%E0%A5%80%E0%A4%A4%E0%A4%BF%20%E0%A4%A4%E0%A4%A5%E0%A4%BE%20%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%AF%E0%A4%95%E0%A5%8D%E0%A4%B0%E0%A4%AE%20.pdf' },
  { year: '2080/81', title: 'Annual Budget and Program 2080/81', kind: 'Annual budget and program', file: '/budget-documents/annual-budget-program-2080-81.pdf', source: officialArchive },
]
const money = (n: number, ne: boolean) => new Intl.NumberFormat(ne ? 'ne-NP' : 'en-IN', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(n)

export function BudgetPublicPage() {
  const { language } = useLanguage()
  const ne = language === 'ne'
  const [data, setData] = useState<BudgetData | null>(null)
  const [year, setYear] = useState('')
  const [query, setQuery] = useState('')
  const [ward, setWard] = useState('all')
  const [sector, setSector] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    fetch(`/api/budget${year ? `?fiscalYear=${encodeURIComponent(year)}` : ''}`, { cache: 'no-store' })
      .then(async response => { if (!response.ok) throw new Error('Budget data service is unavailable.'); return response.json() as Promise<BudgetData> })
      .then(result => { if (active) setData(result) }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Budget data service is unavailable.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [year])
  const projects = (data?.projects ?? []).filter(item => {
    const q = query.trim().toLocaleLowerCase()
    return (ward === 'all' || String(item.wardNumber ?? 'null') === ward) && (sector === 'all' || sector === item.sectorKey) && (!q || `${item.projectName} ${item.expenditureHead ?? ''} ${item.budgetCode ?? ''} ${item.sector}`.toLocaleLowerCase().includes(q))
  })
  return <div className="budget-page">
    <header className="budget-topbar"><a href="/">← {ne ? 'गृहपृष्ठ' : 'Home'}</a><a href={officialArchive} target="_blank" rel="noreferrer">{ne ? 'आधिकारिक बजेट स्रोत' : 'Official budget archive'} ↗</a></header>
    <main className="budget-main">
      <section className="budget-hero"><div><span>{ne ? 'सार्वजनिक वित्त · आधिकारिक स्रोत' : 'PUBLIC FINANCE · OFFICIAL SOURCE'}</span><h1>{ne ? 'चौरपाटी बजेट विवरण' : 'Chaurpati Budget Explorer'}</h1><p>{ne ? 'वार्षिक बजेट वडा, क्षेत्र र आयोजनाअनुसार हेर्नुहोस्।' : 'Explore annual planned allocations by ward, sector, and project.'}</p></div><label>{ne ? 'आर्थिक वर्ष' : 'Fiscal year'}<select value={year} onChange={e => setYear(e.target.value)}><option value="">{ne ? 'नवीनतम उपलब्ध' : 'Latest available'}</option>{(data?.years ?? []).map(item => <option key={item.fiscalYear} value={item.fiscalYear}>{item.fiscalYear}</option>)}</select></label></section>
      {error && <div className="budget-alert">{error}</div>}
      {loading && <div className="budget-empty">{ne ? 'आधिकारिक बजेट विवरण लोड हुँदैछ…' : 'Loading official budget data…'}</div>}
      {!loading && !error && !data?.document && <div className="budget-empty"><h2>{ne ? 'बजेट विवरण उपलब्ध छैन' : 'No verified budget data available yet'}</h2><p>{ne ? 'आधिकारिक स्रोत स्क्यान भएपछि विवरण देखिनेछ।' : 'The automatic source scan may not have connected yet. See the official archive or ask an administrator to import its PDF.'}</p><a href={officialArchive} target="_blank" rel="noreferrer">{ne ? 'आधिकारिक स्रोत खोल्नुहोस्' : 'Open official budget archive'} ↗</a></div>}
      {!loading && data?.document && <>
        <section className="budget-metrics"><article className="budget-total"><span>{ne ? 'कुल प्रस्तावित बजेट' : 'Total planned allocation'}</span><strong>{money(data.totalNpr, ne)}</strong><small>{ne ? 'आर्थिक वर्ष' : 'Fiscal year'} {data.document.fiscalYear}</small></article><article><span>{ne ? 'बजेट शीर्षक' : 'Budget lines'}</span><strong>{data.projectCount}</strong></article><article><span>{ne ? 'क्षेत्र' : 'Sectors'}</span><strong>{data.sectors.length}</strong></article><article><span>{ne ? 'वडा' : 'Wards'}</span><strong>{data.wards.filter(w => w.wardNumber !== null).length} / 7</strong></article></section>
        <section className="budget-source-note"><div><strong>{data.document.title}</strong><p>{ne ? 'यी प्रस्तावित विनियोजन हुन्, वास्तविक खर्च वा लेखापरीक्षण गरिएको खर्च होइनन्।' : 'These are planned allocations, not actual spending or audited expenditure.'}</p><small>{ne ? 'स्रोत जाँच' : 'Source checked'}: {new Date(data.document.checkedAt).toLocaleDateString(ne ? 'ne-NP' : 'en-GB')}</small></div><a href={data.document.sourceUrl} target="_blank" rel="noreferrer">{ne ? 'स्रोत PDF' : 'Open source PDF'} ↗</a></section>
        <section className="budget-chart-grid"><article className="budget-panel"><h2>{ne ? 'वडाअनुसार बजेट' : 'Allocation by ward'}</h2>{data.wards.map(item => <div className="budget-bar-row" key={String(item.wardNumber)}><div><span>{item.wardNumber === null ? (ne ? 'गाउँपालिका / वडा नतोकिएको' : 'Municipality-wide / unassigned') : `${ne ? 'वडा' : 'Ward'} ${item.wardNumber}`}</span><strong>{money(item.totalNpr, ne)}</strong></div><small>{item.projectCount} {ne ? 'शीर्षक' : 'lines'}</small></div>)}</article><article className="budget-panel"><h2>{ne ? 'क्षेत्रअनुसार बजेट' : 'Allocation by sector'}</h2>{data.sectors.map(item => <div className="budget-bar-row" key={item.sectorKey}><div><span>{item.sector}</span><strong>{money(item.totalNpr, ne)}</strong></div><small>{item.projectCount} {ne ? 'शीर्षक' : 'lines'}</small></div>)}</article></section>
        <section className="budget-panel budget-project-panel"><h2>{ne ? 'आयोजना तथा बजेट शीर्षक' : 'Projects and budget lines'}</h2><div className="budget-filters"><input value={query} onChange={e => setQuery(e.target.value)} placeholder={ne ? 'आयोजना वा शीर्षक खोज्नुहोस्' : 'Search projects, expense heads, or codes'} /><select value={ward} onChange={e => setWard(e.target.value)}><option value="all">{ne ? 'सबै वडा' : 'All wards'}</option>{data.wards.map(item => <option key={String(item.wardNumber)} value={String(item.wardNumber)}>{item.wardNumber === null ? 'Municipality-wide' : `Ward ${item.wardNumber}`}</option>)}</select><select value={sector} onChange={e => setSector(e.target.value)}><option value="all">{ne ? 'सबै क्षेत्र' : 'All sectors'}</option>{data.sectors.map(item => <option key={item.sectorKey} value={item.sectorKey}>{item.sector}</option>)}</select></div><div className="budget-table-wrap"><table><thead><tr><th>{ne ? 'वडा' : 'Ward'}</th><th>{ne ? 'क्षेत्र' : 'Sector'}</th><th>{ne ? 'आयोजना' : 'Project / budget item'}</th><th>{ne ? 'खर्च शीर्षक' : 'Expense head'}</th><th>{ne ? 'रकम' : 'Allocated'}</th></tr></thead><tbody>{projects.map(item => <tr key={item.id}><td>{item.wardNumber ? `Ward ${item.wardNumber}` : 'Municipality-wide'}</td><td>{item.sector}</td><td><strong>{item.projectName}</strong></td><td>{item.expenditureHead || item.budgetCode || '—'}</td><td>{money(item.amountNpr, ne)}</td></tr>)}</tbody></table>{!projects.length && <p className="budget-empty">{ne ? 'मिल्दो बजेट शीर्षक छैन।' : 'No matching budget lines.'}</p>}</div></section>
      </>}
      <section className="budget-panel budget-source-documents">
        <div className="budget-documents-heading"><div><span>OFFICIAL MUNICIPAL RECORDS</span><h2>{ne ? 'बजेट तथा नीति दस्तावेज' : 'Budget and policy documents'}</h2><p>{ne ? 'यी आधिकारिक PDF हेर्न वा डाउनलोड गर्न सक्नुहुन्छ।' : 'Open or download the municipal source files used for budget and policy reference.'}</p></div><span className="budget-documents-count">{sourceDocuments.length} PDFs</span></div>
        <div className="budget-documents-grid">{sourceDocuments.map(doc => <article className="budget-document-card" key={doc.file}><span className="budget-document-year">FY {doc.year}</span><h3>{doc.title}</h3><p>{doc.kind}</p><div><a href={doc.file} target="_blank" rel="noreferrer">{ne ? 'PDF हेर्नुहोस्' : 'Open PDF'} ↗</a><a className="budget-document-download" href={doc.file} download>{ne ? 'डाउनलोड' : 'Download'}</a></div><a className="budget-document-source" href={doc.source} target="_blank" rel="noreferrer">{ne ? 'आधिकारिक स्रोत' : 'Official source'} ↗</a></article>)}</div>
        <p className="budget-document-note">{ne ? 'PDF उपलब्ध हुनुको अर्थ विवरण प्रमाणित भएको होइन। प्रमाणित तथ्याङ्क मात्र माथिको बजेट सारांशमा देखाइन्छ।' : 'PDF availability does not mean extracted allocations are verified. Only validated figures appear in the budget summaries above.'}</p>
      </section>
    </main><footer className="budget-footer"><span>Chaurpati Rural Municipality</span><a href="/admin/budget">{ne ? 'प्रशासन' : 'Administration'}</a></footer>
  </div>
}

export function AdminBudgetPage() {
  const { language } = useLanguage()
  const ne = language === 'ne'
  const [key, setKey] = useState(() => sessionStorage.getItem('budget-admin-key') ?? '')
  const [draftKey, setDraftKey] = useState(key)
  const [status, setStatus] = useState<AdminData | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const load = async (adminKey: string) => {
    const r = await fetch('/api/admin/budget', { headers: { Authorization: `Bearer ${adminKey}` }, cache: 'no-store' })
    if (!r.ok) throw new Error(r.status === 401 ? 'Admin API key rejected.' : 'Could not load budget status.')
    setStatus(await r.json() as AdminData)
  }
  useEffect(() => { if (key) void load(key).catch(e => setError(e.message)) }, [key])
  const scan = async () => { setBusy(true); setError(''); setMessage(''); try { const r = await fetch('/api/admin/budget/scan', { method: 'POST', headers: { Authorization: `Bearer ${key}` } }); const body = await r.json(); if (!r.ok || body.error) throw new Error(body.message ?? body.error ?? 'Scan failed.'); await load(key); setMessage('Scan finished. Check document status and parser notes below.') } catch (e) { setError(e instanceof Error ? e.message : 'Scan failed.'); await load(key).catch(() => undefined) } finally { setBusy(false) } }
  const upload = async () => {
    if (!file || !year.trim() || !sourceUrl.trim()) { setError('Choose a PDF and provide its fiscal year and direct official PDF URL.'); return }
    setBusy(true); setError(''); setMessage('')
    try { const form = new FormData(); form.append('file', file); form.append('title', title || file.name); form.append('fiscalYear', year); form.append('sourceUrl', sourceUrl); const r = await fetch('/api/admin/budget/upload', { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form }); const result = await r.json(); if (!r.ok) throw new Error(result.message ?? 'PDF import failed.'); await load(key); setMessage(`${result.status}: ${result.rows} rows extracted. ${result.message ?? ''}`); setFile(null); const input = document.getElementById('budget-file') as HTMLInputElement | null; if (input) input.value = '' } catch (e) { setError(e instanceof Error ? e.message : 'PDF import failed.') } finally { setBusy(false) }
  }
  return <div className="budget-page budget-admin-page"><header className="budget-topbar"><a href="/">← {ne ? 'गृहपृष्ठ' : 'Home'}</a><a href="/budget">{ne ? 'सार्वजनिक बजेट' : 'Public budget'} ↗</a></header><main className="budget-main"><section className="budget-hero"><div><span>CHAURPATI · ADMINISTRATION</span><h1>{ne ? 'बजेट संकलन र अवस्था' : 'Budget data collection'}</h1><p>{ne ? 'आधिकारिक बजेट अभिलेख स्वचालित रूपमा जाँचिन्छ।' : 'The official archive is scanned automatically at startup and every 24 hours.'}</p></div></section>
    {!key ? <form className="budget-key-form" onSubmit={e => { e.preventDefault(); const k = draftKey.trim(); sessionStorage.setItem('budget-admin-key', k); setKey(k); setError('') }}><label>Admin API key<input type="password" value={draftKey} onChange={e => setDraftKey(e.target.value)} /></label><button>Continue</button></form> : <section className="budget-admin-controls"><div><strong>{ne ? 'आधिकारिक स्रोत' : 'Official source'}</strong><p>{status?.scanFinishedAt ? `Last checked ${new Date(status.scanFinishedAt).toLocaleString()}` : 'No scan has completed during this session.'}</p><a href={status?.sourcePage ?? officialArchive} target="_blank" rel="noreferrer">Open municipality archive ↗</a></div><button onClick={() => void scan()} disabled={busy || status?.scanning}>{busy ? 'Working…' : 'Scan official source now'}</button></section>}
    {key && <section className="budget-panel budget-upload-panel"><h2>Import an official budget PDF</h2><p>If this backend cannot reach the official site, download its budget PDF in your browser and import it here. Only a PDF hosted at chaurpatimun.gov.np can be published.</p><div className="budget-upload-grid"><label>Official PDF URL<input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://www.chaurpatimun.gov.np/sites/.../budget.pdf" /></label><label>Fiscal year<input value={year} onChange={e => setYear(e.target.value)} placeholder="2082/83" /></label><label>Title (optional)<input value={title} onChange={e => setTitle(e.target.value)} /></label><label>PDF file<input id="budget-file" type="file" accept="application/pdf,.pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} /></label></div><button onClick={() => void upload()} disabled={busy || !key}>{busy ? 'Processing…' : 'Upload and process PDF'}</button></section>}
    {error && <div className="budget-alert" role="alert">{error}</div>}{message && <div className="budget-success">{message}</div>}{status?.scanError && <div className="budget-alert"><strong>Last automatic scan error:</strong> {status.scanError}</div>}
    <section className="budget-panel budget-admin-docs"><h2>Imported official documents</h2>{!status?.documents.length ? <p>No budget PDFs imported yet.</p> : status.documents.map(doc => <article key={doc.id}><div><strong>{doc.title}</strong><span>{doc.fiscalYear} · {doc.status} · {doc.validRows}/{doc.extractedRows} rows</span>{doc.lastError && <p>{doc.lastError}</p>}{doc.warnings.map(w => <small key={w}>{w}</small>)}</div><a href={doc.sourceUrl} target="_blank" rel="noreferrer">Open source PDF ↗</a></article>)}</section>
    </main></div>
}

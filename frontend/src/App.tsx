import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { apiFetch as fetch, apiUrl } from './api-client'
import type { ReactNode } from 'react'
import type { ChangeEvent } from 'react'
import './App.css'
const AppealsApp = lazy(() => import('./appeals').then((module) => ({ default: module.AppealsApp })))
const AdminAppealsView = lazy(() => import('./admin-appeals').then((module) => ({ default: module.AdminAppealsView })))
const AppealsHomeSection = lazy(() => import('./appeals-home').then((module) => ({ default: module.AppealsHomeSection })))
const MapAdminView = lazy(() => import('./map').then((module) => ({ default: module.MapAdminView })))
const ExploreMapPage = lazy(() => import('./explore-map').then((module) => ({ default: module.ExploreMapPage })))
import { useLanguage } from './language'
import { HomeMapPreview } from './home-map'
const PopularTourism = lazy(() => import('./tourism').then((module) => ({ default: module.PopularTourism })))
const TourismDetailPage = lazy(() => import('./tourism').then((module) => ({ default: module.TourismDetailPage })))
const TourismPage = lazy(() => import('./tourism').then((module) => ({ default: module.TourismPage })))
const AdminTourismView = lazy(() => import('./admin-tourism').then((module) => ({ default: module.AdminTourismView })))
const OfficialServicesPage = lazy(() => import('./official-services').then((module) => ({ default: module.OfficialServicesPage })))
const OfficialServiceDetailPage = lazy(() => import('./official-services').then((module) => ({ default: module.OfficialServiceDetailPage })))
const AdminOfficialServicesPage = lazy(() => import('./official-services').then((module) => ({ default: module.AdminOfficialServicesPage })))
const BudgetPublicPage = lazy(() => import('./budget').then((module) => ({ default: module.BudgetPublicPage })))
const AdminBudgetPage = lazy(() => import('./budget').then((module) => ({ default: module.AdminBudgetPage })))

type Language = 'en' | 'ne'
type Copy = { [key: string]: string }

const copy: Record<Language, Copy> = {
  en: {
    administration: 'ADMINISTRATION', overview: 'Overview', wards: 'Wards', representatives: 'Representatives', notices: 'Notices', documents: 'Documents', map: 'Map editor', import: 'Data import', audit: 'Audit logs', officialSite: 'Official municipality website ↗', sourceFirst: 'Source-first civic platform', municipality: 'CHAURPATI RURAL MUNICIPALITY', greeting: 'Good morning, administrator', syncTitle: 'Official data import', connected: 'API connected', offline: 'API offline', admin: 'System admin', nepali: 'नेपाली', english: 'English', control: 'PORTAL CONTROL CENTER', trusted: 'Build a trusted civic record.', manage: 'Manage verified municipality information, source history, and public updates in one place.', glance: 'AT A GLANCE', portalOverview: 'Portal overview', importOfficial: '↥ Import official data', wardsCount: 'Wards', wardNote: 'All ward profiles', repsCount: 'Representatives', repsNote: 'Awaiting verified import', noticesCount: 'Official notices', noticesNote: 'Database is ready', appealsCount: 'Open appeals', appealsNote: 'No submissions yet', sourceHealth: 'SOURCE HEALTH', connection: 'Official website connection', ready: 'Ready', municipalityName: 'Chaurpati Rural Municipality', noBatches: 'No import batches yet', fetchIntro: 'Fetch the official website to create a reviewable change set. Nothing is published automatically.', openImport: 'Open import center', next: 'NEXT STEPS', setup: 'Set up your portal', fetchOfficial: 'Fetch official municipality data', reviewFirst: 'Review and verify the first batch', addWard: 'Add your first ward profile', appealsSetup: 'Configure public appeal settings', publish: 'Publish the portal identity', startHere: 'Start here', government: 'GOVERNMENT DATA', importHeading: 'Official website import', importIntro: 'Fetch, compare, and approve structured records from the municipality website.', reviewRequired: 'Review required', readyFetch: 'Ready to fetch', primary: 'PRIMARY SOURCE', fetchLatest: 'Fetch latest data', fetching: 'Fetching...', reviewPublish: 'Review before publish', reviewPublishText: 'Imported records enter a pending state.', preserve: 'Preserve manual edits', preserveText: 'Manually edited records are never overwritten.', trail: 'Keep the trail', trailText: 'URL, batch, verifier, and dates are stored.', sections: 'IMPORT SECTIONS', adapters: 'Available adapters', parser: 'Dedicated parser modules', complete: 'Fetch complete. Review required.', staged: 'The batch is staged for comparison and has not changed public content.', reviewChanges: 'Review changes', viewOriginal: 'View original ↗', sourceUrl: 'https://chaurpatimun.gov.np/', officialConnection: 'Official website connection', noImport: 'No import batches yet', source: 'Source-first civic platform', wardsAdapter: 'Wards 1–7', staff: 'Staff directory', gallery: 'Gallery & tourism', budgets: 'Budgets & programs', reports: 'Documents & reports', news: 'Notices & news', info: 'Municipality information', repAdapter: 'Representatives', status: 'Status', importStatus: 'Import status', pending: 'Pending review', online: 'Online', offlineText: 'Backend unavailable', toggle: 'Toggle language', sourceHealthText: 'Official website connection', website: 'Official municipality website', readyText: 'Ready', noData: 'No imported data yet', pendingText: 'No pending changes' , nextStep: 'NEXT STEPS', first: '1 / 5'
      , manualIntro: 'Upload and publish your own verified municipality content. Nothing is fetched automatically.', manualMode: 'Manual publishing', manualSource: 'PORTAL CONTENT', manualTitle: 'Add a notice or document', draft: 'Draft', titleLabel: 'Title', titlePlaceholder: 'Enter the official title', summaryLabel: 'Summary', summaryPlaceholder: 'Add a short public description', fileLabel: 'Attachment', noFile: 'No file selected', publishManual: 'Publish to website', publishedManual: 'Published successfully', visiblePublic: 'This content is now visible on the public website.', noticeAdminKicker: 'NOTICE MANAGEMENT', noticeAdminTitle: 'Create and manage notices', noticeAdminIntro: 'Published notices appear on the public website immediately.', noticeCount: 'notices', noticeCreate: 'CREATE NOTICE', noticeEdit: 'EDIT NOTICE', noticeFormTitle: 'Notice details', publishedStatus: 'Published', cancel: 'Cancel', createNotice: 'Create notice', updateNotice: 'Update notice', noticeListKicker: 'PUBLISHED CONTENT', noticeListTitle: 'Your notices', noNotices: 'No notices created yet.', noSummary: 'No summary added.', edit: 'Edit', delete: 'Delete',
  },
  ne: {
    administration: 'प्रशासन', overview: 'अवलोकन', wards: 'वडाहरू', representatives: 'जनप्रतिनिधिहरू', notices: 'सूचनाहरू', documents: 'कागजातहरू', map: 'नक्सा सम्पादक', import: 'डाटा आयात', audit: 'अडिट लग', officialSite: 'आधिकारिक नगरपालिका वेबसाइट ↗', sourceFirst: 'स्रोतमा आधारित नागरिक पोर्टल', municipality: 'चौरपाटी गाउँपालिका', greeting: 'शुभप्रभात, प्रशासक', syncTitle: 'आधिकारिक डाटा आयात', connected: 'API जोडिएको', offline: 'API अफलाइन', admin: 'प्रणाली प्रशासक', nepali: 'नेपाली', english: 'English', control: 'पोर्टल नियन्त्रण केन्द्र', trusted: 'विश्वसनीय नागरिक अभिलेख बनाउनुहोस्।', manage: 'प्रमाणित नगरपालिका जानकारी, स्रोत इतिहास र सार्वजनिक अद्यावधिकहरू व्यवस्थापन गर्नुहोस्।', glance: 'संक्षिप्त विवरण', portalOverview: 'पोर्टल अवलोकन', importOfficial: '↥ आधिकारिक डाटा आयात', wardsCount: 'वडाहरू', wardNote: 'सबै वडा प्रोफाइल', repsCount: 'जनप्रतिनिधिहरू', repsNote: 'प्रमाणित आयातको प्रतीक्षामा', noticesCount: 'आधिकारिक सूचनाहरू', noticesNote: 'डाटाबेस तयार छ', appealsCount: 'खुला निवेदनहरू', appealsNote: 'अहिलेसम्म कुनै निवेदन छैन', sourceHealth: 'स्रोत अवस्था', connection: 'आधिकारिक वेबसाइट जडान', ready: 'तयार', municipalityName: 'चौरपाटी गाउँपालिका', noBatches: 'अहिलेसम्म कुनै आयात ब्याच छैन', fetchIntro: 'समीक्षा गर्न मिल्ने परिवर्तन सेट बनाउन आधिकारिक वेबसाइट ल्याउनुहोस्। कुनै पनि सामग्री स्वतः प्रकाशित हुँदैन।', openImport: 'आयात केन्द्र खोल्नुहोस्', next: 'अर्को चरण', setup: 'पोर्टल सेटअप गर्नुहोस्', fetchOfficial: 'आधिकारिक नगरपालिका डाटा ल्याउनुहोस्', reviewFirst: 'पहिलो ब्याच समीक्षा र प्रमाणीकरण गर्नुहोस्', addWard: 'पहिलो वडा प्रोफाइल थप्नुहोस्', appealsSetup: 'सार्वजनिक निवेदन सेटिङ मिलाउनुहोस्', publish: 'पोर्टल पहिचान प्रकाशित गर्नुहोस्', startHere: 'यहाँबाट सुरु गर्नुहोस्', government: 'सरकारी डाटा', importHeading: 'आधिकारिक वेबसाइट आयात', importIntro: 'नगरपालिका वेबसाइटबाट संरचित अभिलेख ल्याउनुहोस्, तुलना गर्नुहोस् र स्वीकृत गर्नुहोस्।', reviewRequired: 'समीक्षा आवश्यक', readyFetch: 'ल्याउन तयार', primary: 'प्राथमिक स्रोत', fetchLatest: 'नयाँ डाटा ल्याउनुहोस्', fetching: 'ल्याउँदैछ...', reviewPublish: 'प्रकाशनअघि समीक्षा', reviewPublishText: 'आयात गरिएका अभिलेख समीक्षा अवस्थामा रहनेछन्।', preserve: 'म्यानुअल परिवर्तन सुरक्षित', preserveText: 'म्यानुअल रूपमा सम्पादन गरिएका अभिलेख अधिलेखन हुँदैनन्।', trail: 'इतिहास सुरक्षित राख्नुहोस्', trailText: 'URL, ब्याच, प्रमाणीकरणकर्ता र मिति सुरक्षित हुन्छन्।', sections: 'आयात खण्डहरू', adapters: 'उपलब्ध एडाप्टरहरू', parser: 'समर्पित पार्सर मोड्युल', complete: 'डाटा ल्याइयो। समीक्षा आवश्यक।', staged: 'ब्याच तुलना गर्न राखिएको छ र सार्वजनिक सामग्री परिवर्तन भएको छैन।', reviewChanges: 'परिवर्तन समीक्षा गर्नुहोस्', viewOriginal: 'मूल वेबसाइट हेर्नुहोस् ↗', sourceUrl: 'https://chaurpatimun.gov.np/', officialConnection: 'आधिकारिक वेबसाइट जडान', noImport: 'अहिलेसम्म आयात गरिएको डाटा छैन', source: 'स्रोतमा आधारित नागरिक पोर्टल', wardsAdapter: 'वडा १–७', staff: 'कर्मचारी निर्देशिका', gallery: 'ग्यालरी र पर्यटन', budgets: 'बजेट र कार्यक्रम', reports: 'कागजात र प्रतिवेदन', news: 'सूचना र समाचार', info: 'नगरपालिका जानकारी', repAdapter: 'जनप्रतिनिधिहरू', status: 'अवस्था', importStatus: 'आयात अवस्था', pending: 'समीक्षा बाँकी', online: 'अनलाइन', offlineText: 'ब्याकएन्ड उपलब्ध छैन', toggle: 'भाषा परिवर्तन', sourceHealthText: 'आधिकारिक वेबसाइट जडान', website: 'आधिकारिक नगरपालिका वेबसाइट', readyText: 'तयार', noData: 'अहिलेसम्म डाटा आयात भएको छैन', pendingText: 'समीक्षा गर्नुपर्ने परिवर्तन छैन', nextStep: 'अर्को चरण', first: '१ / ५'
      , manualIntro: 'आफूले प्रमाणित गरेको नगरपालिका सामग्री अपलोड र प्रकाशित गर्नुहोस्। कुनै डाटा स्वतः ल्याइँदैन।', manualMode: 'म्यानुअल प्रकाशन', manualSource: 'पोर्टल सामग्री', manualTitle: 'सूचना वा कागजात थप्नुहोस्', draft: 'ड्राफ्ट', titleLabel: 'शीर्षक', titlePlaceholder: 'आधिकारिक शीर्षक लेख्नुहोस्', summaryLabel: 'सारांश', summaryPlaceholder: 'छोटो सार्वजनिक विवरण लेख्नुहोस्', fileLabel: 'संलग्न कागजात', noFile: 'कुनै फाइल चयन गरिएको छैन', publishManual: 'वेबसाइटमा प्रकाशित गर्नुहोस्', publishedManual: 'सफलतापूर्वक प्रकाशित भयो', visiblePublic: 'यो सामग्री अब सार्वजनिक वेबसाइटमा देखिन्छ।', noticeAdminKicker: 'सूचना व्यवस्थापन', noticeAdminTitle: 'सूचना सिर्जना र व्यवस्थापन', noticeAdminIntro: 'प्रकाशित सूचना सार्वजनिक वेबसाइटमा तुरुन्तै देखिन्छ।', noticeCount: 'सूचना', noticeCreate: 'सूचना सिर्जना', noticeEdit: 'सूचना सम्पादन', noticeFormTitle: 'सूचनाको विवरण', publishedStatus: 'प्रकाशित', cancel: 'रद्द गर्नुहोस्', createNotice: 'सूचना सिर्जना गर्नुहोस्', updateNotice: 'सूचना अद्यावधिक गर्नुहोस्', noticeListKicker: 'प्रकाशित सामग्री', noticeListTitle: 'तपाईंका सूचनाहरू', noNotices: 'अहिलेसम्म कुनै सूचना सिर्जना भएको छैन।', noSummary: 'सारांश थपिएको छैन।', edit: 'सम्पादन', delete: 'मेट्नुहोस्'
  },
}

copy.en.manualIntro = "Upload official municipal documents. They appear under Municipal Services: Download forms & documents, not in Notices."
copy.en.manualSource = 'MUNICIPAL DOCUMENTS'
copy.en.manualTitle = 'Add a municipal document'
copy.en.titlePlaceholder = 'Enter the official document title'
copy.en.fileLabel = 'Document file'
copy.en.publishManual = 'Publish document'
copy.en.publishedManual = 'Document published successfully'
copy.en.visiblePublic = "This document is available in Municipal Services: Download forms & documents."
copy.ne.manualIntro = "\u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 \u0928\u0917\u0930\u092a\u093e\u0932\u093f\u0915\u093e \u0915\u093e\u0917\u091c\u093e\u0924 \u0905\u092a\u0932\u094b\u0921 \u0917\u0930\u094d\u0928\u0941\u0939\u094b\u0938\u094d\u0964 \u0924\u0940 \u0928\u0917\u0930\u092a\u093e\u0932\u093f\u0915\u093e \u0938\u0947\u0935\u093e\u0915\u094b \u0921\u093e\u0909\u0928\u0932\u094b\u0921 \u092b\u093e\u0930\u093e\u092e \u0924\u0925\u093e \u0915\u093e\u0917\u091c\u093e\u0924 \u0916\u0923\u094d\u0921\u092e\u093e \u0926\u0947\u0916\u093f\u0928\u0947\u091b\u0928\u094d, \u0938\u0942\u091a\u0928\u093e\u092e\u093e \u0939\u094b\u0907\u0928\u0964"
copy.ne.manualSource = "\u0928\u0917\u0930\u092a\u093e\u0932\u093f\u0915\u093e \u0915\u093e\u0917\u091c\u093e\u0924"
copy.ne.manualTitle = "\u0928\u0917\u0930\u092a\u093e\u0932\u093f\u0915\u093e \u0915\u093e\u0917\u091c\u093e\u0924 \u0925\u092a\u094d\u0928\u0941\u0939\u094b\u0938\u094d"
copy.ne.titlePlaceholder = "\u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 \u0915\u093e\u0917\u091c\u093e\u0924\u0915\u094b \u0936\u0940\u0930\u094d\u0937\u0915 \u0932\u0947\u0916\u094d\u0928\u0941\u0939\u094b\u0938\u094d"
copy.ne.fileLabel = "\u0915\u093e\u0917\u091c\u093e\u0924 \u092b\u093e\u0907\u0932"
copy.ne.publishManual = "\u0915\u093e\u0917\u091c\u093e\u0924 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0917\u0930\u094d\u0928\u0941\u0939\u094b\u0938\u094d"
copy.ne.publishedManual = "\u0915\u093e\u0917\u091c\u093e\u0924 \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u092d\u092f\u094b"
copy.ne.visiblePublic = "\u092f\u094b \u0915\u093e\u0917\u091c\u093e\u0924 \u0928\u0917\u0930\u092a\u093e\u0932\u093f\u0915\u093e \u0938\u0947\u0935\u093e\u0915\u094b \u0921\u093e\u0909\u0928\u0932\u094b\u0921 \u092b\u093e\u0930\u093e\u092e \u0924\u0925\u093e \u0915\u093e\u0917\u091c\u093e\u0924 \u0916\u0923\u094d\u0921\u092e\u093e \u0909\u092a\u0932\u092c\u094d\u0927 \u091b\u0964"

copy.en.noticePhoto = 'Notice photo'
copy.ne.noticePhoto = 'सूचनाको फोटो'
copy.en.uploadingPhoto = 'Reading photo...'
copy.ne.uploadingPhoto = 'फोटो पढिँदैछ...'
copy.en.noticeSaveError = 'The notice could not be saved to the website. Check the API connection and administrator access, then try again.'
copy.ne.noticeSaveError = 'सूचना सुरक्षित गर्न सकिएन। फेरि प्रयास गर्नुहोस्।'

function AdminApp() {
  const getAdminView = (): 'overview' | 'notices' | 'appeals' | 'sync' | 'map' => window.location.pathname.endsWith('/appeals') || window.location.hash === '#appeals' ? 'appeals' : window.location.hash === '#notices' ? 'notices' : window.location.hash === '#data-import' ? 'sync' : 'overview'
  const [activeView, setActiveView] = useState<'overview' | 'notices' | 'appeals' | 'sync' | 'map'>(getAdminView)
  const [apiConnected, setApiConnected] = useState(false)
  const { language, setLanguage } = useLanguage()
  const t = copy[language]

  useEffect(() => {
    fetch('/api/health').then((response) => setApiConnected(response.ok)).catch(() => setApiConnected(false))
  }, [])

  useEffect(() => {
    const syncViewFromUrl = () => setActiveView(getAdminView())
    window.addEventListener('hashchange', syncViewFromUrl)
    return () => window.removeEventListener('hashchange', syncViewFromUrl)
  }, [])

  const navigateAdmin = (view: 'overview' | 'notices' | 'appeals' | 'sync' | 'map') => {
    window.location.hash = view === 'notices' ? 'notices' : view === 'appeals' ? 'appeals' : view === 'sync' ? 'data-import' : ''
    setActiveView(view)
  }

  const navItems = [[t.overview, 'overview'], [t.wards, 'overview'], [t.representatives, 'overview'], [t.notices, 'notices'], ['जनताको आवाज', 'appeals'], [t.documents, 'overview'], [t.map, 'map'], [t.import, 'sync'], [t.audit, 'overview']] as const

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand-lockup"><img className="brand-mark" src="/chaurpati-emblem.svg" alt="" /><div><strong>Chaurpati</strong><span>Digital Information Portal</span></div></div>
      <div className="workspace-label">{t.administration}</div>
      <nav>{navItems.map(([label, view]) => <button key={label} className={activeView === view ? 'nav-item active' : 'nav-item'} onClick={() => view === 'map' ? window.location.assign('/admin/map') : navigateAdmin(view)}><span className="nav-dot" />{label}</button>)}<button className="nav-item" onClick={() => window.location.assign('/admin/tourism')}><span className="nav-dot" />{language === 'ne' ? 'पर्यटन व्यवस्थापन' : 'Tourism management'}</button><button className="nav-item" onClick={() => window.location.assign('/admin/official-services')}><span className="nav-dot" />{language === 'ne' ? 'सेवा व्यवस्थापन' : 'Official Services'}</button><button className="nav-item" onClick={() => window.location.assign('/admin/budget')}><span className="nav-dot" />{language === 'ne' ? 'बजेट पारदर्शिता' : 'Budget transparency'}</button></nav>
      <div className="sidebar-footer"><a href="/">↗ {language === 'ne' ? 'सार्वजनिक वेबसाइट हेर्नुहोस्' : 'View public website'}</a><a href={t.sourceUrl} target="_blank" rel="noreferrer">{t.officialSite}</a><span>{t.sourceFirst}</span></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><span className="eyebrow">{t.municipality}</span><h1>{activeView === 'sync' ? t.syncTitle : t.greeting}</h1></div><div className="topbar-actions"><span className={apiConnected ? 'api-status connected' : 'api-status'}>{apiConnected ? t.connected : t.offline}</span><button className="lang-button" onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')} aria-label={t.toggle}>{language === 'en' ? t.nepali : t.english}</button><div className="avatar">SA</div><span className="admin-name">{t.admin}</span></div></header>
      {activeView === 'sync' ? <SyncView t={t} /> : activeView === 'notices' ? <NoticeManager t={t} /> : activeView === 'appeals' ? <AdminAppealsView /> : activeView === 'map' ? <MapAdminView /> : <OverviewView onSync={() => navigateAdmin('sync')} t={t} />}
    </main>
  </div>
}

function PublicSite() {
  const [language, setLanguage] = useState<Language>('en')
  const [noticeOnly, setNoticeOnly] = useState(false)
  const [notices, setNotices] = useState<Notice[]>(() => JSON.parse(localStorage.getItem('chaurpati-notices') ?? '[]') as Notice[])
  const [feedNotices, setFeedNotices] = useState<Notice[]>(() => JSON.parse(localStorage.getItem('chaurpati-notices') ?? '[]') as Notice[])
  const [showNoticePopup, setShowNoticePopup] = useState(() => notices.length > 0)
  const [popupNoticeIndex, setPopupNoticeIndex] = useState(0)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const t = copy[language]

  useEffect(() => {
    const stored = localStorage.getItem('chaurpati-manual-updates')
    if (!stored) return
    const latest = JSON.parse(stored)[0] as { title?: string; summary?: string; fileName?: string } | undefined
    if (!latest) return
    const heading = document.querySelector('.public-empty h3')
    const summary = document.querySelector('.public-empty p')
    if (heading) heading.textContent = latest.title || ''
    if (summary) summary.textContent = [latest.summary, latest.fileName].filter(Boolean).join(' • ')
  }, [language])

  useEffect(() => {
    const refreshNotices = () => setNotices(JSON.parse(localStorage.getItem('chaurpati-notices') ?? '[]') as Notice[])
    window.addEventListener('storage', refreshNotices)
    return () => {
      window.removeEventListener('storage', refreshNotices)
    }
  }, [])

  useEffect(() => {
    if (!showNoticePopup || notices.length < 2 || selectedNotice) return
    const timer = window.setInterval(() => setPopupNoticeIndex((current) => (current + 1) % notices.length), 3000)
    return () => window.clearInterval(timer)
  }, [showNoticePopup, notices.length, selectedNotice])

    useEffect(() => {
      fetch('/api/notices').then((response) => response.ok ? response.json() : Promise.reject()).then((data: Notice[]) => { 
        const local = JSON.parse(localStorage.getItem('chaurpati-notices') ?? '[]') as Notice[]; 
        const merged = mergeNoticeImages(data, local); 
        if (merged.length > 0 || notices.length === 0) { 
          setNotices(merged); 
          setFeedNotices(merged); 
          localStorage.setItem('chaurpati-notices', JSON.stringify(merged)) 
        } 
      }).catch(() => undefined)
  }, [])

  useEffect(() => {
    const popup = document.querySelector('.notice-popup')
    if (popup) {
      const currentImage = popup.querySelector('.notice-popup-image') as HTMLImageElement | null
      const currentNotice = notices[popupNoticeIndex]
      if (currentNotice?.imageUrl) {
        const image = currentImage ?? document.createElement('img')
        image.className = 'notice-popup-image'
        image.src = apiUrl(currentNotice.imageUrl)
        image.alt = ''
        if (!currentImage) popup.insertBefore(image, popup.querySelector('h2'))
      } else if (currentImage) {
        currentImage.remove()
      }
    }
    document.querySelectorAll('.public-notice-card').forEach((card, index) => {
      const notice = notices[index]
      const openNotice = () => notice && setSelectedNotice(notice)
      card.addEventListener('click', openNotice)
      card.addEventListener('keydown', (event) => { if ((event as KeyboardEvent).key === 'Enter') openNotice() })
      card.setAttribute('role', 'button')
      card.setAttribute('tabindex', '0')
      if (notice?.imageUrl && !card.querySelector('.notice-row-image')) {
        const image = document.createElement('img')
        image.className = 'notice-row-image'
        image.src = apiUrl(notice.imageUrl)
        image.alt = ''
        card.prepend(image)
      }
    })
  }, [notices, showNoticePopup, popupNoticeIndex])

  return <div className={noticeOnly ? 'public-site notice-only' : 'public-site'}>
    {showNoticePopup && notices[popupNoticeIndex] && <div className="notice-popup-backdrop" role="dialog" aria-modal="true"><div className="notice-popup notice-popup-transition" key={notices[popupNoticeIndex].id}><button className="notice-popup-close" onClick={() => setShowNoticePopup(false)}>×</button><span className="section-kicker">{language === 'ne' ? 'नयाँ आधिकारिक सूचना' : 'NEW OFFICIAL NOTICE'}</span><h2>{notices[popupNoticeIndex].title}</h2><p>{notices[popupNoticeIndex].summary}</p><small>{new Date(notices[popupNoticeIndex].updatedAt).toLocaleDateString()} · {popupNoticeIndex + 1} / {notices.length}</small><div className="notice-popup-controls"><button className="notice-arrow" aria-label={language === 'ne' ? 'अघिल्लो सूचना' : 'Previous notice'} onClick={() => setPopupNoticeIndex((current) => (current - 1 + notices.length) % notices.length)}>←</button><button className="primary-button" onClick={() => { setSelectedNotice(notices[popupNoticeIndex]); setShowNoticePopup(false) }}>{language === 'ne' ? 'सूचना पढ्नुहोस्' : 'Read notice'}</button><button className="notice-arrow" aria-label={language === 'ne' ? 'अर्को सूचना' : 'Next notice'} onClick={() => setPopupNoticeIndex((current) => (current + 1) % notices.length)}>→</button></div></div></div>}
    {selectedNotice && <div className="notice-reader-backdrop" role="dialog" aria-modal="true"><article className="notice-reader"><button className="notice-reader-close" onClick={() => setSelectedNotice(null)}>×</button><span className="section-kicker">{language === 'ne' ? 'आधिकारिक सूचना' : 'OFFICIAL NOTICE'}</span><h1>{selectedNotice.title}</h1><small>{new Date(selectedNotice.updatedAt).toLocaleDateString()}</small>{selectedNotice.imageUrl && <img src={apiUrl(selectedNotice.imageUrl)} alt="" />}<p>{selectedNotice.summary || (language === 'ne' ? 'विवरण उपलब्ध छैन।' : 'No additional details provided.')}</p><span className="public-status">● {language === 'ne' ? 'प्रकाशित सूचना' : 'Published notice'}</span></article></div>}
    <header className="public-header"><a className="public-brand" href="/" onClick={() => setNoticeOnly(false)}><img className="brand-mark" src="/chaurpati-emblem.svg" alt="" /><span><strong>{language === 'ne' ? 'चौरपाटी' : 'Chaurpati'}</strong><small>{language === 'ne' ? 'डिजिटल सूचना पोर्टल' : 'Digital Information Portal'}</small></span></a><nav className="public-nav"><a href="#notices" onClick={() => setNoticeOnly(true)}>{language === 'ne' ? 'सूचनाहरू' : 'Notices'}</a><a href="#wards" onClick={() => setNoticeOnly(false)}>{language === 'ne' ? 'वडाहरू' : 'Wards'}</a><a href="#directory" onClick={() => setNoticeOnly(false)}>{language === 'ne' ? 'निर्देशिका' : 'Directory'}</a><a href="/services">{language === 'ne' ? 'सेवाहरू' : 'Services'}</a><a href="/map" onClick={() => setNoticeOnly(false)}>{language === 'ne' ? 'नक्सा' : 'Map'}</a></nav><button className="public-language" onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}>{language === 'en' ? 'नेपाली' : 'English'}</button></header>
    <main><section className="public-hero"><div><span className="section-kicker">{language === 'ne' ? 'चौरपाटी गाउँपालिका' : 'CHAURPATI RURAL MUNICIPALITY'}</span><h1>{language === 'ne' ? 'तपाईंको स्थानीय सरकारको डिजिटल पोर्टल' : 'Your local government, in one place.'}</h1><p>{language === 'ne' ? 'आधिकारिक सूचना, वडा विवरण, सेवा र सार्वजनिक सामग्रीको आफ्नै डिजिटल स्रोत।' : 'A clear, source-traceable home for official notices, ward information, services, and public updates.'}</p><div className="hero-actions"><a className="public-primary" href="#notices">{language === 'ne' ? 'नयाँ सूचनाहरू हेर्नुहोस्' : 'Explore latest notices'} →</a><a className="public-secondary" href={t.sourceUrl} target="_blank" rel="noreferrer">{language === 'ne' ? 'आधिकारिक वेबसाइट' : 'Official website'} ↗</a></div></div><div className="hero-seal"><img src="/chaurpati-emblem.svg" alt="" /><small>{language === 'ne' ? 'स्रोतमा आधारित' : 'SOURCE FIRST'}</small></div></section><section className="public-content" id="notices"><div className="public-section-heading"><div><span className="section-kicker">{language === 'ne' ? 'ताजा अद्यावधिक' : 'LATEST UPDATES'}</span><h2>{language === 'ne' ? 'आधिकारिक सूचनाहरू' : 'Official notices'}</h2></div><span className="public-status">● {language === 'ne' ? 'प्रमाणित स्रोत' : 'Verified source'}</span></div><div className="public-empty"><span>◎</span><h3>{language === 'ne' ? 'सूचनाहरू समीक्षा भइरहेका छन्' : 'Notices are being prepared'}</h3><p>{language === 'ne' ? 'प्रशासकले आधिकारिक स्रोतबाट समीक्षा गरेपछि सामग्री यहाँ प्रकाशित हुनेछ।' : 'Reviewed official updates will appear here after administrator approval.'}</p></div></section></main><footer className="public-footer"><span>? {language === 'ne' ? '\u091a\u094c\u0930\u092a\u093e\u091f\u0940 \u0921\u093f\u091c\u093f\u091f\u0932 \u0938\u0942\u091a\u0928\u093e \u092a\u094b\u0930\u094d\u091f\u0932' : 'Chaurpati Digital Information Portal'}</span><a href={t.sourceUrl} target="_blank" rel="noreferrer">{t.officialSite}</a></footer>
      {feedNotices.length > 0 && <section className="public-notice-feed"><div className="public-section-heading"><div><span className="section-kicker">{language === 'ne' ? 'प्रकाशित सूचना' : 'PUBLISHED NOTICES'}</span><h2>{language === 'ne' ? 'सबै सूचनाहरू' : 'All notices'}</h2></div></div>{feedNotices.map((notice) => <article className="public-notice-card" key={notice.id}><div><span className="notice-date">{new Date(notice.updatedAt).toLocaleDateString()}</span><h3>{notice.title}</h3><p>{notice.summary}</p></div><span className="public-status">● {language === 'ne' ? 'प्रकाशित' : 'Published'}</span></article>)}</section>}
  </div>
}

function LegacyServiceRedirect({ to }: { to: string }) {
  useEffect(() => { window.location.replace(to) }, [to])
  return <div className="page-body">Redirecting to the official services information hub?</div>
}

function App() {
  const path = window.location.pathname
  let page: ReactNode = <PublicHomePage />
  if (path === '/admin/services') page = <LegacyServiceRedirect to="/admin/official-services" />
  else if (path === '/my-applications' || path === '/services/applications/track' || /^\/services\/[^/]+\/apply$/.test(path)) page = <LegacyServiceRedirect to="/services" />
  else if (path === '/services') page = <OfficialServicesPage />
  else if (path === '/budget') page = <BudgetPublicPage />
  else if (path === '/admin/budget') page = <AdminBudgetPage />
  else if (path === '/admin/official-services') page = <AdminOfficialServicesPage />
  else if (path.startsWith('/services/')) page = <OfficialServiceDetailPage slug={decodeURIComponent(path.slice('/services/'.length))} />
  else if (path === '/map') page = <ExploreMapPage />
  else if (path === '/admin/map') page = <MapAdminView />
  else if (path === '/admin/tourism') page = <AdminTourismView />
  else if (path === '/tourism') page = <TourismPage />
  else if (path.startsWith('/tourism/')) page = <TourismDetailPage slug={decodeURIComponent(path.slice('/tourism/'.length))} />
  else if (path.startsWith('/admin')) page = <AdminApp />
  else if (path.startsWith('/public-appeals') || path === '/my-appeals') page = <AppealsApp />
  return <Suspense fallback={<div className="page-loading" role="status">Loading portal content…</div>}>{page}</Suspense>
}

void PublicSite

function PublicHomePage() {
  const { language, setLanguage } = useLanguage()
  const [noticeOnly, setNoticeOnly] = useState(window.location.hash === '#notices')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [globalQuery, setGlobalQuery] = useState('')
  const [notices, setNotices] = useState<Notice[]>([])
  const [popupIndex, setPopupIndex] = useState(0)
  const [popupOpen, setPopupOpen] = useState(false)
  const [selected, setSelected] = useState<Notice | null>(null)
  const initialNoticeLoad = useRef(true)

  useEffect(() => {
    const load = () => fetch('/api/notices').then((response) => { if (!response.ok) throw new Error('Notices are unavailable'); return response.json() as Promise<Notice[]> }).then((data) => { if (!Array.isArray(data)) throw new Error('Invalid notice response'); const published = data.filter((notice) => notice.published); setNotices(published); localStorage.setItem('chaurpati-notices', JSON.stringify(data)); if (initialNoticeLoad.current) setPopupOpen(published.length > 0); initialNoticeLoad.current = false }).catch(() => { setNotices([]); if (initialNoticeLoad.current) setPopupOpen(false); initialNoticeLoad.current = false })
    load()
    const refreshWhenVisible = () => { if (document.visibilityState === 'visible') load() }
    const timer = window.setInterval(refreshWhenVisible, 20_000)
    window.addEventListener('focus', refreshWhenVisible)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshWhenVisible); document.removeEventListener('visibilitychange', refreshWhenVisible) }
  }, [])
  useEffect(() => {
    if (!popupOpen || notices.length < 2 || selected) return
    const timer = window.setInterval(() => setPopupIndex((current) => (current + 1) % notices.length), 3000)
    return () => window.clearInterval(timer)
  }, [popupOpen, notices.length, selected])
  useEffect(() => {
    const handleHash = () => setNoticeOnly(window.location.hash === '#notices')
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const setSection = (hash: string) => { window.location.hash = hash; setNoticeOnly(hash === '#notices'); setMobileMenuOpen(false) }
  const t = language === 'ne'
  const current = notices[popupIndex]

  return <div className={noticeOnly ? 'public-site notice-only' : 'public-site reference-home'}>
    {popupOpen && current && <div className="notice-popup-backdrop" role="dialog" aria-modal="true"><div className="notice-popup notice-popup-transition" key={current.id}><button className="notice-popup-close" onClick={() => setPopupOpen(false)}>×</button><span className="section-kicker">{t ? 'नयाँ आधिकारिक सूचना' : 'NEW OFFICIAL NOTICE'}</span><h2>{current.title}</h2><p>{current.summary}</p><small>{new Date(current.updatedAt).toLocaleDateString()} · {popupIndex + 1} / {notices.length}</small><div className="notice-popup-controls"><button className="notice-arrow" onClick={() => setPopupIndex((index) => (index - 1 + notices.length) % notices.length)}>←</button><button className="primary-button" onClick={() => { setSelected(current); setPopupOpen(false) }}>{t ? 'सूचना पढ्नुहोस्' : 'Read notice'}</button><button className="notice-arrow" onClick={() => setPopupIndex((index) => (index + 1) % notices.length)}>→</button></div></div></div>}
    {selected && <div className="notice-reader-backdrop" role="dialog" aria-modal="true"><article className="notice-reader"><button className="notice-reader-close" onClick={() => setSelected(null)}>×</button><span className="section-kicker">{t ? 'आधिकारिक सूचना' : 'OFFICIAL NOTICE'}</span><h1>{selected.title}</h1><small>{new Date(selected.updatedAt).toLocaleDateString()}</small>{selected.imageUrl && <img src={apiUrl(selected.imageUrl)} alt="" />}<p>{selected.summary || (t ? 'थप विवरण उपलब्ध छैन।' : 'No additional details provided.')}</p>{selected.attachmentUrl && <p><a href={apiUrl(selected.attachmentUrl)} target="_blank" rel="noreferrer" download>{t ? 'संलग्न कागजात खोल्नुहोस् वा डाउनलोड गर्नुहोस्' : 'Open or download attachment'}</a></p>}</article></div>}
    <header className="reference-header"><div className="reference-topline"><span>✉ info@chaurpatimun.gov.np</span><span>☎ +977-9812345678</span><span>⌖ {t ? 'चौरपाटी गाउँपालिका, अछाम' : 'Chaurpati Rural Municipality, Achham'}</span><span className="header-spacer" /><a href="https://chaurpatimun.gov.np/" target="_blank" rel="noreferrer">Official Website ↗</a><button onClick={() => setLanguage(t ? 'en' : 'ne')}>{t ? 'English' : 'नेपाली'}</button></div><div className="reference-nav"><a className="reference-logo" href="/" onClick={() => setSection('')}><img className="reference-emblem" src="/chaurpati-emblem.svg" alt="" /><span><strong>{t ? 'चौरपाटी गाउँपालिका' : 'Chaurpati Rural Municipality'}</strong><small>{t ? 'अछाम, सुदूरपश्चिम प्रदेश' : 'Achham, Sudurpashchim Province'}</small></span></a><nav><a href="#" onClick={() => setSection('')}>{t ? 'गृहपृष्ठ' : 'Home'}</a><a href="/services">{t ? 'सेवा' : 'Services'}</a><a href="/tourism">{t ? 'पर्यटकीय स्थल' : 'Tourism'}</a><a href="/budget">{t ? 'बजेट' : 'Budget'}</a><a href="/map">{t ? 'नक्सा हेर्नुहोस्' : 'Explore map'}</a><a href="#notices" onClick={() => setSection('#notices')}>{t ? 'सूचना' : 'Notices'}</a></nav><a className="reference-search" href="/map" aria-label={t ? 'Map search' : 'Search places'}>{'\u2315'}</a><button className="header-language-toggle" type="button" onClick={() => setLanguage(t ? 'en' : 'ne')}>{t ? 'English' : '\u0928\u0947\u092a\u093e\u0932\u0940'}</button><button className="mobile-menu-toggle" type="button" aria-expanded={mobileMenuOpen} aria-controls="mobile-primary-navigation" onClick={() => setMobileMenuOpen((open) => !open)}><span aria-hidden="true">{mobileMenuOpen ? '-' : '+'}</span><span>{mobileMenuOpen ? 'Close' : 'Menu'}</span></button>{mobileMenuOpen && <nav className="mobile-primary-navigation" id="mobile-primary-navigation" aria-label="Primary navigation"><a href="/" onClick={() => setSection('')}>{t ? '\u0917\u0943\u0939\u092a\u0943\u0937\u094d\u0920' : 'Home'}</a><a href="/services">{t ? '\u0938\u0947\u0935\u093e\u0939\u0930\u0942' : 'Services'}</a><a href="/tourism">{t ? '\u092a\u0930\u094d\u092f\u091f\u0928' : 'Tourism'}</a><a href="/budget">{t ? '\u092c\u091c\u0947\u091f' : 'Budget transparency'}</a><a href="/map">{t ? '\u0928\u0915\u094d\u0938\u093e' : 'Explore map'}</a><a href="/public-appeals">{t ? '\u091c\u0928\u0924\u093e\u0915\u094b \u0906\u0935\u093e\u091c' : 'Public voice'}</a><a href="#notices" onClick={() => setSection('#notices')}>{t ? '\u0938\u0942\u091a\u0928\u093e\u0939\u0930\u0942' : 'Notices'}</a><a href="https://chaurpatimun.gov.np/" target="_blank" rel="noreferrer">{t ? '\u0906\u0927\u093f\u0915\u093e\u0930\u093f\u0915 \u0935\u0947\u092c\u0938\u093e\u0907\u091f' : 'Official website'} ?</a></nav>}</div></header>
    {!noticeOnly && <main><section className="reference-hero"><div className="hero-copy"><span className="reference-kicker">{t ? 'समृद्ध चौरपाटी, सुखी नागरिक, सुन्दर भविष्य' : 'A prosperous Chaurpati, a thriving community'}</span><h1>{t ? 'चौरपाटी गाउँपालिका' : 'Chaurpati Rural Municipality'}</h1><p>{t ? 'अछाम, सुदूरपश्चिम प्रदेश' : 'Achham, Sudurpashchim Province'}</p><form className="reference-searchbox" role="search" onSubmit={(event) => { event.preventDefault(); const term = globalQuery.trim(); if (term) window.location.assign(`/map?q=${encodeURIComponent(term)}`) }}><span aria-hidden="true">{'\u2315'}</span><input aria-label={t ? '\u0938\u094d\u0925\u093e\u0928 \u0916\u094b\u091c\u094d\u0928\u0941\u0939\u094b\u0938\u094d' : 'Search services and places'} value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)} placeholder={t ? '\u0935\u093f\u0926\u094d\u092f\u093e\u0932\u092f, \u092e\u0928\u094d\u0926\u093f\u0930, \u0938\u0947\u0935\u093e \u0935\u093e \u0938\u094d\u0925\u093e\u0928 \u0916\u094b\u091c\u094d\u0928\u0941\u0939\u094b\u0938\u094d' : 'Search places, services, notices, and tourism'} /><button type="submit">{t ? '\u0916\u094b\u091c\u094d\u0928\u0941\u0939\u094b\u0938\u094d' : 'Search'}</button></form><div className="hero-shortcuts"><button onClick={() => window.location.assign('/map')}>▧ {t ? 'नक्सा हेर्नुहोस्' : 'Explore map'}</button><button onClick={() => window.location.assign('/tourism')}>◆ {t ? 'पर्यटन स्थलहरू' : 'Tourism places'}</button><button onClick={() => setSection('#appeals')}>⚑ {t ? 'जनताको आवाज' : 'Public voice'}</button><button onClick={() => window.location.assign('/services')}>▤ {t ? 'सेवाहरू' : 'Services'}</button><button onClick={() => window.location.assign('/budget')}>▤ {t ? 'बजेट' : 'Budget'}</button></div></div></section><section className="reference-grid"><article className="reference-panel" id="notices"><header><h2>▣ {t ? 'ताजा सूचना' : 'Latest notices'}</h2><a href="#notices" onClick={() => setSection('#notices')}>{t ? 'सबै हेर्नुहोस् →' : 'View all →'}</a></header>{notices.slice(0, 4).map((notice) => <button className="mini-notice" key={notice.id} onClick={() => setSelected(notice)}><time>{new Date(notice.updatedAt).toLocaleDateString()}</time><span>{notice.title}</span><b>→</b></button>)}</article></section><HomeMapPreview /></main>}
    {!noticeOnly && <PopularTourism />}
    {!noticeOnly && <AppealsHomeSection language={language} />}
    {noticeOnly && <section className="reference-notices-feed" id="notices"><div className="reference-section-title"><span className="reference-kicker">{t ? 'प्रकाशित सूचना' : 'PUBLISHED NOTICES'}</span><h1>{t ? 'सबै सूचनाहरू' : 'All notices'}</h1></div>{notices.map((notice) => <article className="reference-notice-card" key={notice.id} onClick={() => setSelected(notice)}><div>{notice.imageUrl && <img src={apiUrl(notice.imageUrl)} alt="" />}<div><time>{new Date(notice.updatedAt).toLocaleDateString()}</time><h2>{notice.title}</h2><p>{notice.summary}</p>{notice.attachmentUrl && <a href={apiUrl(notice.attachmentUrl)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>{t ? 'संलग्न कागजात हेर्नुहोस्' : 'View attachment'}</a>}</div></div><span>● {t ? 'प्रकाशित' : 'Published'}</span></article>)}</section>}
    <footer className="public-footer"><section className="public-footer-identity"><img src="/chaurpati-emblem.svg" alt="Chaurpati Rural Municipality emblem"/><div><strong>{t ? '\u091a\u094c\u0930\u092a\u093e\u091f\u0940 \u0917\u093e\u0909\u0901\u092a\u093e\u0932\u093f\u0915\u093e' : 'Chaurpati Rural Municipality'}</strong><span>Achham, Nepal</span><p>Official information of Chaurpati Rural Municipality.</p></div></section><section><h2>Important links</h2><nav aria-label="Important links"><a href="/services">Services</a><a href="/budget">Budget transparency</a><a href="/map">Explore map</a><a href="/tourism">Tourism</a><a href="/public-appeals">Public voice</a><a href="#notices" onClick={() => setSection('#notices')}>Notices</a></nav></section><section><h2>Contact</h2><a href="mailto:info@chaurpatimun.gov.np">info@chaurpatimun.gov.np</a><a href="tel:+9779812345678">+977-9812345678</a><a href="https://chaurpatimun.gov.np/" target="_blank" rel="noreferrer">Official municipality website</a></section></footer>
  </div>
}

function OverviewView({ onSync, t }: { onSync: () => void; t: Copy }) {
  const metrics = [['07', t.wardsCount, t.wardNote], ['00', t.repsCount, t.repsNote], ['00', t.noticesCount, t.noticesNote], ['00', t.appealsCount, t.appealsNote]]
  return <div className="page-body"><section className="welcome-banner"><div><span className="section-kicker">{t.control}</span><h2>{t.trusted}</h2><p>{t.manage}</p></div><div className="banner-orbit">✦</div></section><div className="section-heading"><div><span className="section-kicker">{t.glance}</span><h2>{t.portalOverview}</h2></div><button className="primary-button" onClick={onSync}>{t.importOfficial}</button></div><section className="metric-grid">{metrics.map(([value, label, note]) => <article className="metric-card" key={label}><span className="metric-value">{value}</span><strong>{label}</strong><small>{note}</small></article>)}</section><div className="content-grid"><section className="panel"><div className="panel-heading"><div><span className="section-kicker">{t.sourceHealth}</span><h3>{t.connection}</h3></div><span className="status-pill"><i /> {t.ready}</span></div><div className="source-row"><div className="source-icon">◎</div><div><strong>{t.municipalityName}</strong><p>chaurpatimun.gov.np</p></div><a href={t.sourceUrl} target="_blank" rel="noreferrer">{t.viewOriginal}</a></div><div className="empty-state"><span>↥</span><strong>{t.noBatches}</strong><p>{t.fetchIntro}</p><button className="secondary-button" onClick={onSync}>{t.openImport}</button></div></section><section className="panel checklist"><div className="panel-heading"><div><span className="section-kicker">{t.next}</span><h3>{t.setup}</h3></div><span className="progress-count">{t.first}</span></div>{[t.fetchOfficial, t.reviewFirst, t.addWard, t.appealsSetup, t.publish].map((item, index) => <div className={index === 0 ? 'check-row current' : 'check-row'} key={item}><span className="check-icon">{index === 0 ? '→' : '○'}</span><span>{item}</span>{index === 0 && <small>{t.startHere}</small>}</div>)}</section></div></div>
}

type Notice = { id: string; title: string; summary: string; imageUrl?: string; attachmentUrl?: string; published: boolean; updatedAt: string }

function mergeNoticeImages(remote: Notice[], local: Notice[]) {
  return remote.map((notice) => {
    const localNotice = local.find((item) => item.id === notice.id || (item.title === notice.title && item.summary === notice.summary))
    return notice.imageUrl ? notice : { ...notice, imageUrl: localNotice?.imageUrl ?? '' }
  })
}

function NoticeManager({ t }: { t: Copy }) {
  const keyStore = 'chaurpati-admin-key'
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(keyStore) ?? '')
  const [keyDraft, setKeyDraft] = useState(() => sessionStorage.getItem(keyStore) ?? '')
  const [notices, setNotices] = useState<Notice[]>(() => JSON.parse(localStorage.getItem('chaurpati-notices') ?? '[]') as Notice[])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageLoading, setImageLoading] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetch('/api/notices').then((response) => response.ok ? response.json() : Promise.reject()).then(async (data: Notice[]) => {
      const localNotices = JSON.parse(localStorage.getItem('chaurpati-notices') ?? '[]') as Notice[]
      if (data.length === 0 && localNotices.length > 0) {
        setNotices([])
      } else {
        const merged = mergeNoticeImages(data, localNotices)
        setNotices(merged)
        localStorage.setItem('chaurpati-notices', JSON.stringify(merged))
      }
    }).catch(() => undefined)
  }, [])

  const persist = (next: Notice[]) => {
    setNotices(next)
    localStorage.setItem('chaurpati-notices', JSON.stringify(next))
  }

  const reset = () => { setEditingId(null); setTitle(''); setSummary(''); setImageUrl(''); setImageLoading(false); setSaveError('') }
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageLoading(true)
    const reader = new FileReader()
    reader.onload = () => { setImageUrl(String(reader.result)); setImageLoading(false) }
    reader.onerror = () => setImageLoading(false)
    reader.readAsDataURL(file)
  }
    const save = async () => {
      if (!title.trim() || imageLoading) return
        setSaveError('')
      const notice: Notice = { id: editingId ?? crypto.randomUUID(), title: title.trim(), summary: summary.trim(), imageUrl, published: true, updatedAt: new Date().toISOString() }
          try {
            const response = await fetch(editingId ? `/api/notices/${editingId}` : '/api/notices', { method: editingId ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${adminKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(notice) })
            if (!response.ok) throw new Error(`${response.status}`)
            const savedNotice = await response.json() as Notice
            persist(editingId ? notices.map((item) => item.id === editingId ? savedNotice : item) : [savedNotice, ...notices])
            reset()
          } catch {
            setSaveError(t.noticeSaveError)
          }
  }
  const edit = (notice: Notice) => { setEditingId(notice.id); setTitle(notice.title); setSummary(notice.summary); setImageUrl(notice.imageUrl ?? ''); setImageLoading(false) }
  const remove = async (id: string) => { try { const response = await fetch(`/api/notices/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminKey}` } }); if (!response.ok) throw new Error(); persist(notices.filter((notice) => notice.id !== id)) } catch { setSaveError(t.noticeSaveError) } }

  if (!adminKey) return <div className="page-body"><section className="manual-card admin-key-entry"><h2>Notice administration</h2><p>Enter the configured ADMIN_API_KEY to create or manage public notices.</p><label>Admin API key<input type="password" autoComplete="current-password" value={keyDraft} onChange={(event) => setKeyDraft(event.target.value)} /></label><button className="primary-button" onClick={() => { const value = keyDraft.trim(); sessionStorage.setItem(keyStore, value); setAdminKey(value) }}>Continue</button></section></div>
  return <div className="page-body"><div className="sync-intro"><div><span className="section-kicker">{t.noticeAdminKicker}</span><h2>{t.noticeAdminTitle}</h2><p>{t.noticeAdminIntro}</p></div><span className="status-pill large"><i />{notices.length} {t.noticeCount}</span></div>{saveError && <p role="status" className="review-notice">{saveError}</p>}<div className="notice-admin-grid"><section className="manual-card"><div className="manual-card-heading"><div><span className="section-kicker">{editingId ? t.noticeEdit : t.noticeCreate}</span><h3>{t.noticeFormTitle}</h3></div><span className="status-pill"><i />{t.publishedStatus}</span></div><label>{t.titleLabel}<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.titlePlaceholder} /></label><label>{t.summaryLabel}<textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder={t.summaryPlaceholder} rows={5} /></label><label>{t.noticePhoto}<input type="file" accept="image/*" onChange={handlePhotoChange} /></label>{imageLoading && <small className="upload-status">{t.uploadingPhoto}</small>}{imageUrl && <img className="notice-photo-preview" src={apiUrl(imageUrl)} alt={t.noticePhoto} />}<div className="manual-actions"><button className="secondary-button" onClick={reset}>{t.cancel}</button><button className="primary-button" onClick={save} disabled={imageLoading}>{imageLoading ? t.uploadingPhoto : editingId ? t.updateNotice : t.createNotice}</button></div></section><section className="notice-list"><div className="panel-heading"><div><span className="section-kicker">{t.noticeListKicker}</span><h3>{t.noticeListTitle}</h3></div></div>{notices.length === 0 ? <div className="notice-list-empty">{t.noNotices}</div> : notices.map((notice) => <article className="notice-row" key={notice.id}>{notice.imageUrl && <img className="notice-row-image" src={apiUrl(notice.imageUrl)} alt="" />}<div><strong>{notice.title}</strong><p>{notice.summary || t.noSummary}</p><small>{new Date(notice.updatedAt).toLocaleString()}</small></div><div className="notice-actions"><button className="text-button" onClick={() => edit(notice)}>{t.edit}</button><button className="text-button danger" onClick={() => remove(notice.id)}>{t.delete}</button></div></article>)}</section></div></div>
}

function SyncView({ t }: { t: Copy }) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const keyStore = 'chaurpati-admin-key'
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(keyStore) ?? '')
  const [keyDraft, setKeyDraft] = useState(() => sessionStorage.getItem(keyStore) ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const saveManualUpdate = async () => {
    if (!title.trim() || !adminKey || saving) return
    setSaving(true); setSaved(false); setError('')
    try {
      let attachmentUrl: string | undefined
      if (file) {
        const form = new FormData()
        form.append('file', file)
        const upload = await fetch('/api/documents/upload', { method: 'POST', headers: { Authorization: `Bearer ${adminKey}` }, body: form })
        const uploadData = await upload.json().catch(() => ({})) as { attachmentUrl?: string; message?: string }
        if (!upload.ok || !uploadData.attachmentUrl) throw new Error(uploadData.message || `Attachment upload failed (${upload.status})`)
        attachmentUrl = uploadData.attachmentUrl
      }
      const response = await fetch('/api/documents', { method: 'POST', headers: { Authorization: `Bearer ${adminKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), summary: summary.trim(), attachmentUrl }) })
      const result = await response.json().catch(() => ({})) as { message?: string }
      if (!response.ok) throw new Error(result.message || `Publish failed (${response.status})`)
      setSaved(true)
      setTitle(''); setSummary(''); setFile(null)
      const input = document.getElementById('manual-notice-file') as HTMLInputElement | null
      if (input) input.value = ''
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Could not publish this notice.'
      if (message.toLowerCase().includes('admin access') || message.toLowerCase().includes('unauthorized')) { sessionStorage.removeItem(keyStore); setAdminKey(''); setKeyDraft('') }
      setError(message)
    } finally { setSaving(false) }
  }

  const authorize = () => { const value = keyDraft.trim(); if (!value) return; sessionStorage.setItem(keyStore, value); setAdminKey(value); setError('') }

  return <div className="page-body"><div className="sync-intro"><div><span className="section-kicker">{t.government}</span><h2>{t.importHeading}</h2><p>{t.manualIntro}</p></div><span className="status-pill large"><i />{t.manualMode}</span></div><section className="manual-card"><div className="manual-card-heading"><div><span className="section-kicker">{t.manualSource}</span><h3>{t.manualTitle}</h3></div><span className="status-pill"><i />{saved ? t.publishedStatus : t.draft}</span></div>{!adminKey && <div className="admin-key-entry"><label>Admin API key<input type="password" autoComplete="current-password" value={keyDraft} onChange={(event) => setKeyDraft(event.target.value)} placeholder="Enter ADMIN_API_KEY" /></label><button className="secondary-button" onClick={authorize}>Continue</button><small>Use the ADMIN_API_KEY configured for this site. It is kept in this browser tab.</small></div>}<label>{t.titleLabel}<input value={title} onChange={(event) => { setTitle(event.target.value); setSaved(false) }} placeholder={t.titlePlaceholder} /></label><label>{t.summaryLabel}<textarea value={summary} onChange={(event) => { setSummary(event.target.value); setSaved(false) }} placeholder={t.summaryPlaceholder} rows={4} /></label><label>{t.fileLabel}<input id="manual-notice-file" type="file" accept=".csv,.json,.xlsx,.geojson,.pdf" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setSaved(false) }} /></label><div className="manual-actions"><span>{file?.name || t.noFile}</span><button className="primary-button" onClick={() => void saveManualUpdate()} disabled={!adminKey || !title.trim() || !file || saving}>{saving ? 'Publishing…' : t.publishManual}</button></div>{error && <p role="alert" className="review-notice">{error}</p>}{saved && <div className="review-notice"><strong>{t.publishedManual}</strong><span>{t.visiblePublic} <a href="/services#documents">View in documents</a></span></div>}</section></div>
}

export default App

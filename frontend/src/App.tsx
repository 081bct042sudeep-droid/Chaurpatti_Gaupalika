import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './App.css'
import { AppealsApp } from './appeals'
import { AdminAppealsView } from './admin-appeals'
import { AppealsHomeSection } from './appeals-home'

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

copy.en.noticePhoto = 'Notice photo'
copy.ne.noticePhoto = 'सूचनाको फोटो'
copy.en.uploadingPhoto = 'Reading photo...'
copy.ne.uploadingPhoto = 'फोटो पढिँदैछ...'
copy.en.noticeSaveError = 'The API could not save this notice. It is saved only in this browser and will appear on this device.'
copy.ne.noticeSaveError = 'सूचना सुरक्षित गर्न सकिएन। फेरि प्रयास गर्नुहोस्।'

function AdminApp() {
  const getAdminView = (): 'overview' | 'notices' | 'appeals' | 'sync' => window.location.pathname.endsWith('/appeals') || window.location.hash === '#appeals' ? 'appeals' : window.location.hash === '#notices' ? 'notices' : window.location.hash === '#data-import' ? 'sync' : 'overview'
  const [activeView, setActiveView] = useState<'overview' | 'notices' | 'appeals' | 'sync'>(getAdminView)
  const [apiConnected, setApiConnected] = useState(false)
  const [language, setLanguage] = useState<Language>('en')
  const t = copy[language]

  useEffect(() => {
    fetch('/api/health').then((response) => setApiConnected(response.ok)).catch(() => setApiConnected(false))
  }, [])

  useEffect(() => {
    const syncViewFromUrl = () => setActiveView(getAdminView())
    window.addEventListener('hashchange', syncViewFromUrl)
    return () => window.removeEventListener('hashchange', syncViewFromUrl)
  }, [])

  const navigateAdmin = (view: 'overview' | 'notices' | 'appeals' | 'sync') => {
    window.location.hash = view === 'notices' ? 'notices' : view === 'appeals' ? 'appeals' : view === 'sync' ? 'data-import' : ''
    setActiveView(view)
  }

  const navItems = [[t.overview, 'overview'], [t.wards, 'overview'], [t.representatives, 'overview'], [t.notices, 'notices'], ['जनताको आवाज', 'appeals'], [t.documents, 'overview'], [t.map, 'overview'], [t.import, 'sync'], [t.audit, 'overview']] as const

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand-lockup"><div className="brand-mark">CP</div><div><strong>Chaurpati</strong><span>Digital Information Portal</span></div></div>
      <div className="workspace-label">{t.administration}</div>
      <nav>{navItems.map(([label, view]) => <button key={label} className={activeView === view ? 'nav-item active' : 'nav-item'} onClick={() => navigateAdmin(view)}><span className="nav-dot" />{label}</button>)}</nav>
      <div className="sidebar-footer"><a href="/">↗ {language === 'ne' ? 'सार्वजनिक वेबसाइट हेर्नुहोस्' : 'View public website'}</a><a href={t.sourceUrl} target="_blank" rel="noreferrer">{t.officialSite}</a><span>{t.sourceFirst}</span></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><span className="eyebrow">{t.municipality}</span><h1>{activeView === 'sync' ? t.syncTitle : t.greeting}</h1></div><div className="topbar-actions"><span className={apiConnected ? 'api-status connected' : 'api-status'}>{apiConnected ? t.connected : t.offline}</span><button className="lang-button" onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')} aria-label={t.toggle}>{language === 'en' ? t.nepali : t.english}</button><div className="avatar">SA</div><span className="admin-name">{t.admin}</span></div></header>
      {activeView === 'sync' ? <SyncView t={t} /> : activeView === 'notices' ? <NoticeManager t={t} /> : activeView === 'appeals' ? <AdminAppealsView /> : <OverviewView onSync={() => navigateAdmin('sync')} t={t} />}
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
        image.src = currentNotice.imageUrl
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
        image.src = notice.imageUrl
        image.alt = ''
        card.prepend(image)
      }
    })
  }, [notices, showNoticePopup, popupNoticeIndex])

  return <div className={noticeOnly ? 'public-site notice-only' : 'public-site'}>
    {showNoticePopup && notices[popupNoticeIndex] && <div className="notice-popup-backdrop" role="dialog" aria-modal="true"><div className="notice-popup notice-popup-transition" key={notices[popupNoticeIndex].id}><button className="notice-popup-close" onClick={() => setShowNoticePopup(false)}>×</button><span className="section-kicker">{language === 'ne' ? 'नयाँ आधिकारिक सूचना' : 'NEW OFFICIAL NOTICE'}</span><h2>{notices[popupNoticeIndex].title}</h2><p>{notices[popupNoticeIndex].summary}</p><small>{new Date(notices[popupNoticeIndex].updatedAt).toLocaleDateString()} · {popupNoticeIndex + 1} / {notices.length}</small><div className="notice-popup-controls"><button className="notice-arrow" aria-label={language === 'ne' ? 'अघिल्लो सूचना' : 'Previous notice'} onClick={() => setPopupNoticeIndex((current) => (current - 1 + notices.length) % notices.length)}>←</button><button className="primary-button" onClick={() => { setSelectedNotice(notices[popupNoticeIndex]); setShowNoticePopup(false) }}>{language === 'ne' ? 'सूचना पढ्नुहोस्' : 'Read notice'}</button><button className="notice-arrow" aria-label={language === 'ne' ? 'अर्को सूचना' : 'Next notice'} onClick={() => setPopupNoticeIndex((current) => (current + 1) % notices.length)}>→</button></div></div></div>}
    {selectedNotice && <div className="notice-reader-backdrop" role="dialog" aria-modal="true"><article className="notice-reader"><button className="notice-reader-close" onClick={() => setSelectedNotice(null)}>×</button><span className="section-kicker">{language === 'ne' ? 'आधिकारिक सूचना' : 'OFFICIAL NOTICE'}</span><h1>{selectedNotice.title}</h1><small>{new Date(selectedNotice.updatedAt).toLocaleDateString()}</small>{selectedNotice.imageUrl && <img src={selectedNotice.imageUrl} alt="" />}<p>{selectedNotice.summary || (language === 'ne' ? 'विवरण उपलब्ध छैन।' : 'No additional details provided.')}</p><span className="public-status">● {language === 'ne' ? 'प्रकाशित सूचना' : 'Published notice'}</span></article></div>}
    <header className="public-header"><a className="public-brand" href="/" onClick={() => setNoticeOnly(false)}><span className="brand-mark">CP</span><span><strong>{language === 'ne' ? 'चौरपाटी' : 'Chaurpati'}</strong><small>{language === 'ne' ? 'डिजिटल सूचना पोर्टल' : 'Digital Information Portal'}</small></span></a><nav className="public-nav"><a href="#notices" onClick={() => setNoticeOnly(true)}>{language === 'ne' ? 'सूचनाहरू' : 'Notices'}</a><a href="#wards" onClick={() => setNoticeOnly(false)}>{language === 'ne' ? 'वडाहरू' : 'Wards'}</a><a href="#directory" onClick={() => setNoticeOnly(false)}>{language === 'ne' ? 'निर्देशिका' : 'Directory'}</a><a href="#map" onClick={() => setNoticeOnly(false)}>{language === 'ne' ? 'नक्सा' : 'Map'}</a></nav><button className="public-language" onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}>{language === 'en' ? 'नेपाली' : 'English'}</button></header>
    <main><section className="public-hero"><div><span className="section-kicker">{language === 'ne' ? 'चौरपाटी गाउँपालिका' : 'CHAURPATI RURAL MUNICIPALITY'}</span><h1>{language === 'ne' ? 'तपाईंको स्थानीय सरकारको डिजिटल पोर्टल' : 'Your local government, in one place.'}</h1><p>{language === 'ne' ? 'आधिकारिक सूचना, वडा विवरण, सेवा र सार्वजनिक सामग्रीको आफ्नै डिजिटल स्रोत।' : 'A clear, source-traceable home for official notices, ward information, services, and public updates.'}</p><div className="hero-actions"><a className="public-primary" href="#notices">{language === 'ne' ? 'नयाँ सूचनाहरू हेर्नुहोस्' : 'Explore latest notices'} →</a><a className="public-secondary" href={t.sourceUrl} target="_blank" rel="noreferrer">{language === 'ne' ? 'आधिकारिक वेबसाइट' : 'Official website'} ↗</a></div></div><div className="hero-seal"><span>CP</span><small>{language === 'ne' ? 'स्रोतमा आधारित' : 'SOURCE FIRST'}</small></div></section><section className="public-content" id="notices"><div className="public-section-heading"><div><span className="section-kicker">{language === 'ne' ? 'ताजा अद्यावधिक' : 'LATEST UPDATES'}</span><h2>{language === 'ne' ? 'आधिकारिक सूचनाहरू' : 'Official notices'}</h2></div><span className="public-status">● {language === 'ne' ? 'प्रमाणित स्रोत' : 'Verified source'}</span></div><div className="public-empty"><span>◎</span><h3>{language === 'ne' ? 'सूचनाहरू समीक्षा भइरहेका छन्' : 'Notices are being prepared'}</h3><p>{language === 'ne' ? 'प्रशासकले आधिकारिक स्रोतबाट समीक्षा गरेपछि सामग्री यहाँ प्रकाशित हुनेछ।' : 'Reviewed official updates will appear here after administrator approval.'}</p></div><div className="public-links" id="wards"><article><span>01</span><strong>{language === 'ne' ? 'वडा निर्देशिका' : 'Ward directory'}</strong><p>{language === 'ne' ? 'सबै ७ वडाको जानकारी' : 'Information for all 7 wards'}</p></article><article id="directory"><span>02</span><strong>{language === 'ne' ? 'सेवा र कागजात' : 'Services & documents'}</strong><p>{language === 'ne' ? 'आधिकारिक फारम र प्रतिवेदन' : 'Official forms and reports'}</p></article><article id="map"><span>03</span><strong>{language === 'ne' ? 'स्थानीय नक्सा' : 'Local map'}</strong><p>{language === 'ne' ? 'स्थान र सार्वजनिक पूर्वाधार' : 'Places and public infrastructure'}</p></article></div></section></main><footer className="public-footer"><span>© {language === 'ne' ? 'चौरपाटी डिजिटल सूचना पोर्टल' : 'Chaurpati Digital Information Portal'}</span><a href={t.sourceUrl} target="_blank" rel="noreferrer">{t.officialSite}</a></footer>
      {feedNotices.length > 0 && <section className="public-notice-feed"><div className="public-section-heading"><div><span className="section-kicker">{language === 'ne' ? 'प्रकाशित सूचना' : 'PUBLISHED NOTICES'}</span><h2>{language === 'ne' ? 'सबै सूचनाहरू' : 'All notices'}</h2></div></div>{feedNotices.map((notice) => <article className="public-notice-card" key={notice.id}><div><span className="notice-date">{new Date(notice.updatedAt).toLocaleDateString()}</span><h3>{notice.title}</h3><p>{notice.summary}</p></div><span className="public-status">● {language === 'ne' ? 'प्रकाशित' : 'Published'}</span></article>)}</section>}
  </div>
}

function App() {
  if (window.location.pathname.startsWith('/admin')) return <AdminApp />
  if (window.location.pathname.startsWith('/public-appeals') || window.location.pathname === '/my-appeals') return <AppealsApp />
  return <PublicHomePage />
}

void PublicSite

function PublicHomePage() {
  const [language, setLanguage] = useState<Language>('ne')
  const [noticeOnly, setNoticeOnly] = useState(window.location.hash === '#notices')
  const [notices, setNotices] = useState<Notice[]>(() => (JSON.parse(localStorage.getItem('chaurpati-notices') ?? '[]') as Notice[]).filter((notice) => notice.published))
  const [popupIndex, setPopupIndex] = useState(0)
  const [popupOpen, setPopupOpen] = useState(false)
  const [selected, setSelected] = useState<Notice | null>(null)
  const initialNoticeLoad = useRef(true)

  useEffect(() => {
    const load = () => fetch('/api/notices').then((response) => { if (!response.ok) throw new Error('Notices are unavailable'); return response.json() as Promise<Notice[]> }).then((data) => { if (!Array.isArray(data)) throw new Error('Invalid notice response'); const local = JSON.parse(localStorage.getItem('chaurpati-notices') ?? '[]') as Notice[]; const records = data.length === 0 && local.length > 0 ? local : data; const published = records.filter((notice) => notice.published); setNotices(published); if (data.length > 0) localStorage.setItem('chaurpati-notices', JSON.stringify(data)); if (initialNoticeLoad.current) setPopupOpen(published.length > 0); initialNoticeLoad.current = false }).catch(() => { const local = (JSON.parse(localStorage.getItem('chaurpati-notices') ?? '[]') as Notice[]).filter((notice) => notice.published); setNotices(local); if (initialNoticeLoad.current) setPopupOpen(local.length > 0); initialNoticeLoad.current = false })
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

  const setSection = (hash: string) => { window.location.hash = hash; setNoticeOnly(hash === '#notices') }
  const t = language === 'ne'
  const current = notices[popupIndex]

  return <div className={noticeOnly ? 'public-site notice-only' : 'public-site reference-home'}>
    {popupOpen && current && <div className="notice-popup-backdrop" role="dialog" aria-modal="true"><div className="notice-popup notice-popup-transition" key={current.id}><button className="notice-popup-close" onClick={() => setPopupOpen(false)}>×</button><span className="section-kicker">{t ? 'नयाँ आधिकारिक सूचना' : 'NEW OFFICIAL NOTICE'}</span><h2>{current.title}</h2><p>{current.summary}</p><small>{new Date(current.updatedAt).toLocaleDateString()} · {popupIndex + 1} / {notices.length}</small><div className="notice-popup-controls"><button className="notice-arrow" onClick={() => setPopupIndex((index) => (index - 1 + notices.length) % notices.length)}>←</button><button className="primary-button" onClick={() => { setSelected(current); setPopupOpen(false) }}>{t ? 'सूचना पढ्नुहोस्' : 'Read notice'}</button><button className="notice-arrow" onClick={() => setPopupIndex((index) => (index + 1) % notices.length)}>→</button></div></div></div>}
    {selected && <div className="notice-reader-backdrop" role="dialog" aria-modal="true"><article className="notice-reader"><button className="notice-reader-close" onClick={() => setSelected(null)}>×</button><span className="section-kicker">{t ? 'आधिकारिक सूचना' : 'OFFICIAL NOTICE'}</span><h1>{selected.title}</h1><small>{new Date(selected.updatedAt).toLocaleDateString()}</small>{selected.imageUrl && <img src={selected.imageUrl} alt="" />}<p>{selected.summary}</p></article></div>}
    <header className="reference-header"><div className="reference-topline"><span>✉ info@chaurpatimun.gov.np</span><span>☎ +977-9812345678</span><span>⌖ चौरपाटी गाउँपालिका, अछाम</span><span className="header-spacer" /><a href="https://chaurpatimun.gov.np/" target="_blank" rel="noreferrer">Official Website ↗</a><button onClick={() => setLanguage(t ? 'en' : 'ne')}>{t ? 'English' : 'नेपाली'}</button></div><div className="reference-nav"><a className="reference-logo" href="/" onClick={() => setSection('')}><span className="reference-emblem">CP</span><span><strong>{t ? 'चौरपाटी गाउँपालिका' : 'Chaurpati Rural Municipality'}</strong><small>अछाम, सुदूरपश्चिम प्रदेश</small></span></a><nav><a href="#" onClick={() => setSection('')}>{t ? 'गृहपृष्ठ' : 'Home'}</a><a href="#wards">{t ? 'चौरपाटी' : 'Municipality'}</a><a href="#wards">{t ? 'वडाहरू' : 'Wards'}</a><a href="#directory">{t ? 'जनप्रतिनिधि' : 'Representatives'}</a><a href="#services">{t ? 'सेवा' : 'Services'}</a><a href="#map">{t ? 'नक्सा' : 'Map'}</a><a href="#notices" onClick={() => setSection('#notices')}>{t ? 'सूचना' : 'Notices'}</a></nav><button className="reference-search">⌕</button></div></header>
    {!noticeOnly && <main><section className="reference-hero"><div className="hero-copy"><span className="reference-kicker">{t ? 'समृद्ध चौरपाटी, सुखी नागरिक, सुन्दर भविष्य' : 'A prosperous Chaurpati, a thriving community'}</span><h1>{t ? 'चौरपाटी गाउँपालिका' : 'Chaurpati Rural Municipality'}</h1><p>{t ? 'अछाम, सुदूरपश्चिम प्रदेश' : 'Achham, Sudurpashchim Province'}</p><div className="reference-searchbox">⌕ <span>{t ? 'के खोज्नुहुन्छ ? (जस्तै: विद्यालय, मन्दिर, पर्यटकीय स्थल, वडा, सेवा...)' : 'What are you looking for?'}</span><button>{t ? 'खोज्नुहोस्' : 'Search'}</button></div><div className="hero-shortcuts"><button onClick={() => setSection('#map')}>▧ {t ? 'नक्सा हेर्नुहोस्' : 'Explore map'}</button><button onClick={() => setSection('#tourism')}>◆ {t ? 'पर्यटन स्थलहरू' : 'Tourism places'}</button><button onClick={() => setSection('#appeals')}>⚑ {t ? 'जनताको आवाज' : 'Public voice'}</button><button onClick={() => setSection('#documents')}>▤ {t ? 'सेवाहरू' : 'Services'}</button></div></div></section><section className="reference-stats" id="wards">{[['▥', '७', t ? 'वडाहरू' : 'Wards'], ['♜', '३०+', t ? 'विद्यालयहरू' : 'Schools'], ['♜', '२०+', t ? 'धार्मिक स्थल' : 'Heritage sites'], ['◆', '२५+', t ? 'पर्यटन स्थलहरू' : 'Tourism places'], ['♥', '५+', t ? 'स्वास्थ्य संस्थाहरू' : 'Health facilities'], ['▤', '१००+', t ? 'पूर्वाधार योजनाहरू' : 'Infrastructure projects']].map(([icon, value, label]) => <article key={label}><span>{icon}</span><strong>{value}</strong><small>{label}</small></article>)}</section><section className="reference-grid"><article className="reference-panel" id="notices"><header><h2>▣ {t ? 'ताजा सूचना' : 'Latest notices'}</h2><a href="#notices" onClick={() => setSection('#notices')}>{t ? 'सबै हेर्नुहोस् →' : 'View all →'}</a></header>{notices.slice(0, 4).map((notice) => <button className="mini-notice" key={notice.id} onClick={() => setSelected(notice)}><time>{new Date(notice.updatedAt).toLocaleDateString()}</time><span>{notice.title}</span><b>→</b></button>)}</article><article className="reference-panel feature-place" id="tourism"><header><h2>♟ {t ? 'लोकप्रिय पर्यटकीय स्थल' : 'Popular tourism place'}</h2><a href="#tourism">{t ? 'सबै हेर्नुहोस् →' : 'View all →'}</a></header><div className="place-image" /><h3>शान्तिकोट मन्दिर</h3><small>{t ? 'धार्मिक स्थल · वडा ३' : 'Heritage place · Ward 3'}</small></article><article className="reference-panel reps-panel" id="directory"><header><h2>♟ {t ? 'जनप्रतिनिधि' : 'Representatives'}</h2><a href="#directory">{t ? 'सबै हेर्नुहोस् →' : 'View all →'}</a></header><div className="rep-placeholder">{t ? 'प्रमाणित जनप्रतिनिधि विवरण यहाँ देखिनेछ।' : 'Verified representative profiles will appear here.'}</div></article></section><section className="reference-map" id="map"><div><h2>{t ? 'चौरपाटी नक्सा' : 'Chaurpati map'}</h2><p>{t ? 'विद्यालय, मन्दिर, स्वास्थ्य संस्था, सडक, खोला र पर्यटकीय स्थलहरू।' : 'Schools, heritage, health facilities, roads, rivers, and tourism places.'}</p><button>{t ? 'पूर्ण नक्सा हेर्नुहोस् →' : 'Open full map →'}</button></div><div className="map-dots">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ left: `${8 + ((index * 17) % 84)}%`, top: `${18 + ((index * 29) % 60)}%` }} />)}</div></section></main>}
    {!noticeOnly && <AppealsHomeSection />}
    {noticeOnly && <section className="reference-notices-feed" id="notices"><div className="reference-section-title"><span className="reference-kicker">{t ? 'प्रकाशित सूचना' : 'PUBLISHED NOTICES'}</span><h1>{t ? 'सबै सूचनाहरू' : 'All notices'}</h1></div>{notices.map((notice) => <article className="reference-notice-card" key={notice.id} onClick={() => setSelected(notice)}><div>{notice.imageUrl && <img src={notice.imageUrl} alt="" />}<div><time>{new Date(notice.updatedAt).toLocaleDateString()}</time><h2>{notice.title}</h2><p>{notice.summary}</p></div></div><span>● {t ? 'प्रकाशित' : 'Published'}</span></article>)}</section>}
    <footer className="public-footer"><span>© {t ? 'चौरपाटी डिजिटल सूचना पोर्टल' : 'Chaurpati Digital Information Portal'}</span><a href="https://chaurpatimun.gov.np/" target="_blank" rel="noreferrer">Official municipality website ↗</a></footer>
  </div>
}

function OverviewView({ onSync, t }: { onSync: () => void; t: Copy }) {
  const metrics = [['07', t.wardsCount, t.wardNote], ['00', t.repsCount, t.repsNote], ['00', t.noticesCount, t.noticesNote], ['00', t.appealsCount, t.appealsNote]]
  return <div className="page-body"><section className="welcome-banner"><div><span className="section-kicker">{t.control}</span><h2>{t.trusted}</h2><p>{t.manage}</p></div><div className="banner-orbit">✦</div></section><div className="section-heading"><div><span className="section-kicker">{t.glance}</span><h2>{t.portalOverview}</h2></div><button className="primary-button" onClick={onSync}>{t.importOfficial}</button></div><section className="metric-grid">{metrics.map(([value, label, note]) => <article className="metric-card" key={label}><span className="metric-value">{value}</span><strong>{label}</strong><small>{note}</small></article>)}</section><div className="content-grid"><section className="panel"><div className="panel-heading"><div><span className="section-kicker">{t.sourceHealth}</span><h3>{t.connection}</h3></div><span className="status-pill"><i /> {t.ready}</span></div><div className="source-row"><div className="source-icon">◎</div><div><strong>{t.municipalityName}</strong><p>chaurpatimun.gov.np</p></div><a href={t.sourceUrl} target="_blank" rel="noreferrer">{t.viewOriginal}</a></div><div className="empty-state"><span>↥</span><strong>{t.noBatches}</strong><p>{t.fetchIntro}</p><button className="secondary-button" onClick={onSync}>{t.openImport}</button></div></section><section className="panel checklist"><div className="panel-heading"><div><span className="section-kicker">{t.next}</span><h3>{t.setup}</h3></div><span className="progress-count">{t.first}</span></div>{[t.fetchOfficial, t.reviewFirst, t.addWard, t.appealsSetup, t.publish].map((item, index) => <div className={index === 0 ? 'check-row current' : 'check-row'} key={item}><span className="check-icon">{index === 0 ? '→' : '○'}</span><span>{item}</span>{index === 0 && <small>{t.startHere}</small>}</div>)}</section></div></div>
}

type Notice = { id: string; title: string; summary: string; imageUrl?: string; published: boolean; updatedAt: string }

function mergeNoticeImages(remote: Notice[], local: Notice[]) {
  return remote.map((notice) => {
    const localNotice = local.find((item) => item.id === notice.id || (item.title === notice.title && item.summary === notice.summary))
    return notice.imageUrl ? notice : { ...notice, imageUrl: localNotice?.imageUrl ?? '' }
  })
}

function NoticeManager({ t }: { t: Copy }) {
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
        const migrated = await Promise.all(localNotices.map((notice) => fetch('/api/notices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(notice) }).then((response) => response.json() as Promise<Notice>)))
        setNotices(migrated)
        localStorage.setItem('chaurpati-notices', JSON.stringify(migrated))
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
            const response = await fetch(editingId ? `/api/notices/${editingId}` : '/api/notices', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(notice) })
            if (!response.ok) throw new Error(`${response.status}`)
            const savedNotice = await response.json() as Notice
            persist(editingId ? notices.map((item) => item.id === editingId ? savedNotice : item) : [savedNotice, ...notices])
            reset()
          } catch {
            persist(editingId ? notices.map((item) => item.id === notice.id ? notice : item) : [notice, ...notices])
            setSaveError(t.noticeSaveError)
          }
  }
  const edit = (notice: Notice) => { setEditingId(notice.id); setTitle(notice.title); setSummary(notice.summary); setImageUrl(notice.imageUrl ?? ''); setImageLoading(false) }
  const remove = async (id: string) => { try { await fetch(`/api/notices/${id}`, { method: 'DELETE' }) } catch { /* Keep the local copy removable while the API is offline. */ } persist(notices.filter((notice) => notice.id !== id)) }

  return <div className="page-body"><div className="sync-intro"><div><span className="section-kicker">{t.noticeAdminKicker}</span><h2>{t.noticeAdminTitle}</h2><p>{t.noticeAdminIntro}</p></div><span className="status-pill large"><i />{notices.length} {t.noticeCount}</span></div>{saveError && <p role="status" className="review-notice">{saveError}</p>}<div className="notice-admin-grid"><section className="manual-card"><div className="manual-card-heading"><div><span className="section-kicker">{editingId ? t.noticeEdit : t.noticeCreate}</span><h3>{t.noticeFormTitle}</h3></div><span className="status-pill"><i />{t.publishedStatus}</span></div><label>{t.titleLabel}<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.titlePlaceholder} /></label><label>{t.summaryLabel}<textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder={t.summaryPlaceholder} rows={5} /></label><label>{t.noticePhoto}<input type="file" accept="image/*" onChange={handlePhotoChange} /></label>{imageLoading && <small className="upload-status">{t.uploadingPhoto}</small>}{imageUrl && <img className="notice-photo-preview" src={imageUrl} alt={t.noticePhoto} />}<div className="manual-actions"><button className="secondary-button" onClick={reset}>{t.cancel}</button><button className="primary-button" onClick={save} disabled={imageLoading}>{imageLoading ? t.uploadingPhoto : editingId ? t.updateNotice : t.createNotice}</button></div></section><section className="notice-list"><div className="panel-heading"><div><span className="section-kicker">{t.noticeListKicker}</span><h3>{t.noticeListTitle}</h3></div></div>{notices.length === 0 ? <div className="notice-list-empty">{t.noNotices}</div> : notices.map((notice) => <article className="notice-row" key={notice.id}>{notice.imageUrl && <img className="notice-row-image" src={notice.imageUrl} alt="" />}<div><strong>{notice.title}</strong><p>{notice.summary || t.noSummary}</p><small>{new Date(notice.updatedAt).toLocaleString()}</small></div><div className="notice-actions"><button className="text-button" onClick={() => edit(notice)}>{t.edit}</button><button className="text-button danger" onClick={() => remove(notice.id)}>{t.delete}</button></div></article>)}</section></div></div>
}

function SyncView({ t }: { t: Copy }) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [fileName, setFileName] = useState('')
  const [saved, setSaved] = useState(false)

  const saveManualUpdate = () => {
    if (!title.trim()) return
    const update = { title: title.trim(), summary: summary.trim(), fileName, publishedAt: new Date().toISOString() }
    localStorage.setItem('chaurpati-manual-updates', JSON.stringify([update]))
    setSaved(true)
  }

  return <div className="page-body"><div className="sync-intro"><div><span className="section-kicker">{t.government}</span><h2>{t.importHeading}</h2><p>{t.manualIntro}</p></div><span className="status-pill large"><i />{t.manualMode}</span></div><section className="manual-card"><div className="manual-card-heading"><div><span className="section-kicker">{t.manualSource}</span><h3>{t.manualTitle}</h3></div><span className="status-pill"><i />{t.draft}</span></div><label>{t.titleLabel}<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.titlePlaceholder} /></label><label>{t.summaryLabel}<textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder={t.summaryPlaceholder} rows={4} /></label><label>{t.fileLabel}<input type="file" accept=".csv,.json,.xlsx,.geojson,.pdf,image/*" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')} /></label><div className="manual-actions"><span>{fileName || t.noFile}</span><button className="primary-button" onClick={saveManualUpdate}>{t.publishManual}</button></div>{saved && <div className="review-notice"><strong>{t.publishedManual}</strong><span>{t.visiblePublic}</span></div>}</section></div>
}

export default App

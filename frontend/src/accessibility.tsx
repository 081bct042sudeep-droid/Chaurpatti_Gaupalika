import { useEffect, useState } from 'react'
import './accessibility.css'
import { useLanguage } from './language'

type Preferences = {
  largeText: boolean
  highContrast: boolean
  reducedMotion: boolean
  lowBandwidth: boolean
}

const preferenceKey = 'chaurpati-accessibility'
const defaults: Preferences = { largeText: false, highContrast: false, reducedMotion: false, lowBandwidth: false }

export function AccessibilityTools() {
  const { language } = useLanguage()
  const ne = language === 'ne'
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(preferenceKey) || '{}') as Partial<Preferences> } }
    catch { return defaults }
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('a11y-large-text', preferences.largeText)
    root.classList.toggle('a11y-high-contrast', preferences.highContrast)
    root.classList.toggle('a11y-reduced-motion', preferences.reducedMotion)
    root.classList.toggle('a11y-low-bandwidth', preferences.lowBandwidth)
    try { localStorage.setItem(preferenceKey, JSON.stringify(preferences)) } catch { /* Accessibility settings still apply for this visit. */ }
  }, [preferences])

  useEffect(() => {
    if (!preferences.lowBandwidth) return
    const pauseImage = (image: HTMLImageElement) => {
      if (image.closest('.tile-plane, .leaflet-tile-container')) return
      if (image.getAttribute('src')?.includes('chaurpati-emblem.svg')) return
      const source = image.getAttribute('src')
      const sourceSet = image.getAttribute('srcset')
      if (source) { image.dataset.lowBandwidthSrc = source; image.removeAttribute('src') }
      if (sourceSet) { image.dataset.lowBandwidthSrcset = sourceSet; image.removeAttribute('srcset') }
    }
    document.querySelectorAll('img').forEach((image) => pauseImage(image))
    const observer = new MutationObserver((changes) => changes.forEach((change) => {
      if (change.type === 'attributes' && change.target instanceof HTMLImageElement) pauseImage(change.target)
      change.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        if (node instanceof HTMLImageElement) pauseImage(node)
        node.querySelectorAll('img').forEach((image) => pauseImage(image))
      })
    }))
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'srcset'] })
    return () => {
      observer.disconnect()
      document.querySelectorAll<HTMLImageElement>('img[data-low-bandwidth-src], img[data-low-bandwidth-srcset]').forEach((image) => {
        if (image.dataset.lowBandwidthSrc) { image.setAttribute('src', image.dataset.lowBandwidthSrc); delete image.dataset.lowBandwidthSrc }
        if (image.dataset.lowBandwidthSrcset) { image.setAttribute('srcset', image.dataset.lowBandwidthSrcset); delete image.dataset.lowBandwidthSrcset }
      })
    }
  }, [preferences.lowBandwidth])

  const toggle = (key: keyof Preferences) => setPreferences((current) => ({ ...current, [key]: !current[key] }))

  return <aside className="accessibility-tools">
    <button className="accessibility-trigger" type="button" aria-expanded={open} aria-controls="accessibility-options" onClick={() => setOpen((value) => !value)}>
      <span aria-hidden="true">◉</span> {ne ? '\u0938\u0939\u091c\u0924\u093e' : 'Accessibility'}
    </button>
    {open && <section className="accessibility-panel" id="accessibility-options" aria-label={ne ? '\u0938\u0939\u091c\u0924\u093e \u0938\u0947\u091f\u093f\u0919' : 'Accessibility settings'}>
      <div className="accessibility-panel-heading"><strong>{ne ? '\u0938\u0939\u091c\u0924\u093e \u0935\u093f\u0915\u0932\u094d\u092a' : 'Accessibility'}</strong><button type="button" aria-label={ne ? '\u092c\u0928\u094d\u0926 \u0917\u0930\u094d\u0928\u0941\u0939\u094b\u0938\u094d' : 'Close accessibility settings'} onClick={() => setOpen(false)}>×</button></div>
      <button type="button" aria-pressed={preferences.largeText} onClick={() => toggle('largeText')}>A+ {ne ? '\u0920\u0942\u0932\u094b \u0905\u0915\u094d\u0937\u0930' : 'Larger text'}</button>
      <button type="button" aria-pressed={preferences.highContrast} onClick={() => toggle('highContrast')}>◐ {ne ? '\u0909\u091a\u094d\u091a \u0915\u0928\u094d\u091f\u094d\u0930\u093e\u0938\u094d\u091f' : 'High contrast'}</button>
      <button type="button" aria-pressed={preferences.reducedMotion} onClick={() => toggle('reducedMotion')}>Ⅱ {ne ? '\u0917\u0924\u093f \u0915\u092e \u0917\u0930\u094d\u0928\u0941\u0939\u094b\u0938\u094d' : 'Reduce motion'}</button>
      <button type="button" aria-pressed={preferences.lowBandwidth} onClick={() => toggle('lowBandwidth')}>▤ {ne ? '\u0915\u092e \u0907\u0928\u094d\u091f\u0930\u0928\u0947\u091f \u092e\u094b\u0921' : 'Low-bandwidth mode'}</button>
      <p>{ne ? '\u0935\u093f\u0915\u0932\u094d\u092a\u0939\u0930\u0942 \u092f\u0938\u0948 \u0909\u092a\u0915\u0930\u0923\u092e\u093e \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0939\u0941\u0928\u094d\u091b\u0928\u094d\u0964' : 'Settings are saved on this device. Low-bandwidth mode pauses photos while keeping map tiles available.'}</p>
    </section>}
  </aside>
}

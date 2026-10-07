import { useEffect, useMemo, useRef, useState } from 'react'
import { apiFetch as fetch } from './api-client'
import { useLanguage } from './language'

type MapPlace = { id: string; latitude?: number | null; longitude?: number | null }
type Point = { latitude: number; longitude: number }

export function HomeMapPreview() {
  const { language } = useLanguage()
  const ne = language === 'ne'
  const sectionRef = useRef<HTMLElement>(null)
  const [nearViewport, setNearViewport] = useState(false)
  const [places, setPlaces] = useState<MapPlace[]>([])
  const [loaded, setLoaded] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (!('IntersectionObserver' in window)) { setNearViewport(true); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setNearViewport(true)
      observer.disconnect()
    }, { rootMargin: '250px' })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!nearViewport) return
    const controller = new AbortController()
    fetch('/api/map/places', { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<MapPlace[]> : Promise.reject(new Error('Map places unavailable')))
      .then((records) => setPlaces(Array.isArray(records) ? records : []))
      .catch(() => { if (!controller.signal.aborted) setUnavailable(true) })
      .finally(() => { if (!controller.signal.aborted) setLoaded(true) })
    return () => controller.abort()
  }, [nearViewport])

  const coordinates = useMemo(() => places.flatMap((place): Point[] => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
    ? [{ latitude: Number(place.latitude), longitude: Number(place.longitude) }]
    : []), [places])

  const embedUrl = useMemo(() => {
    const configuredLat = Number(import.meta.env.VITE_MAP_CENTER_LAT)
    const configuredLon = Number(import.meta.env.VITE_MAP_CENTER_LON)
    const center: Point | null = coordinates.length
      ? { latitude: coordinates.reduce((sum, point) => sum + point.latitude, 0) / coordinates.length, longitude: coordinates.reduce((sum, point) => sum + point.longitude, 0) / coordinates.length }
      : Number.isFinite(configuredLat) && Number.isFinite(configuredLon) && (configuredLat !== 0 || configuredLon !== 0)
        ? { latitude: configuredLat, longitude: configuredLon }
        : null
    if (!center) return ''
    const latitudeSpan = Math.max(.025, ...coordinates.map((point) => Math.abs(point.latitude - center.latitude)))
    const longitudeSpan = Math.max(.025, ...coordinates.map((point) => Math.abs(point.longitude - center.longitude)))
    const south = center.latitude - latitudeSpan * 1.35
    const north = center.latitude + latitudeSpan * 1.35
    const west = center.longitude - longitudeSpan * 1.35
    const east = center.longitude + longitudeSpan * 1.35
    const bounds = [west, south, east, north].map((value) => value.toFixed(5)).join(',')
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bounds)}&layer=mapnik`
  }, [coordinates])

  return <section className="reference-map" id="map" ref={sectionRef}>
    <div className="reference-map-copy">
      <span className="section-kicker">{ne ? '\u0928\u0917\u0930\u092a\u093e\u0932\u093f\u0915\u093e \u0928\u0915\u094d\u0938\u093e' : 'MUNICIPAL MAP'}</span>
      <h2>{ne ? '\u091a\u094c\u0930\u092a\u093e\u091f\u0940 \u0928\u0915\u094d\u0938\u093e' : 'Chaurpati map'}</h2>
      <p>{ne ? '\u0935\u0921\u093e\u0939\u0930\u0942\u0915\u094b \u0935\u093f\u0935\u0930\u0923 \u0930 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0938\u094d\u0925\u093e\u0928\u0939\u0930\u0942 \u0928\u0915\u094d\u0938\u093e\u092e\u093e \u0939\u0947\u0930\u094d\u0928\u0941\u0939\u094b\u0938\u094d\u0964' : 'Explore published municipal places and ward information on the map.'}</p>
      {coordinates.length > 0 && <p className="home-map-count">{coordinates.length} {ne ? '\u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0938\u094d\u0925\u093e\u0928\u0939\u0930\u0942' : 'published places with coordinates'}</p>}
      <a className="home-map-link" href="/map">{ne ? '\u092a\u0942\u0930\u094d\u0923 \u0928\u0915\u094d\u0938\u093e \u0939\u0947\u0930\u094d\u0928\u0941\u0939\u094b\u0938\u094d' : 'Open full map'} <span aria-hidden="true">↗</span></a>
    </div>
    <div className="home-map-frame">
      {embedUrl ? <iframe title={ne ? '\u091a\u094c\u0930\u092a\u093e\u091f\u0940 \u0938\u093e\u0930\u094d\u0935\u091c\u0928\u093f\u0915 \u0928\u0915\u094d\u0938\u093e' : 'Chaurpati interactive map preview'} src={embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        : <div className="home-map-status" role="status">{!loaded ? (ne ? '\u0928\u0915\u094d\u0938\u093e \u0932\u094b\u0921 \u0939\u0941\u0901\u0926\u0948\u091b...' : 'Loading map preview…') : unavailable ? (ne ? '\u0928\u0915\u094d\u0938\u093e \u0905\u0939\u093f\u0932\u0947 \u0909\u092a\u0932\u092c\u094d\u0927 \u091b\u0948\u0928\u0964 \u092a\u0942\u0930\u094d\u0923 \u0928\u0915\u094d\u0938\u093e \u0916\u094b\u0932\u094d\u0928\u0941\u0939\u094b\u0938\u094d\u0964' : 'The map preview is temporarily unavailable. Open the full map to try again.') : (ne ? '\u0928\u0915\u094d\u0938\u093e \u0926\u0947\u0916\u093e\u0909\u0928\u0935\u093e\u0932\u093e \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0938\u094d\u0925\u093e\u0928 \u0909\u092a\u0932\u092c\u094d\u0927 \u091b\u0948\u0928\u0964' : 'No published map coordinates are available yet.')}</div>}
    </div>
    <small className="home-map-credit">Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></small>
  </section>
}

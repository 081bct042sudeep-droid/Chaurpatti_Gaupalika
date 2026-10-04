import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import './map.css'

type Category = { id: string; slug: string; nameNp: string; nameEn: string; icon?: string }
type Place = { id: string; slug: string; nameNp: string; nameEn?: string; descriptionNp?: string; descriptionEn?: string; categoryId: string; category: Category; wardNumber?: number | null; latitude?: number | null; longitude?: number | null; geometryType: string; geometry?: string | null; address?: string; phone?: string; email?: string; website?: string; imageUrl?: string; openingHours?: string; sourceName?: string; sourceUrl?: string; isVerified: boolean; isPublished?: boolean }
type Appeal = { id: string; title: string; wardId?: string; status: string; supportCount: number; commentCount: number; latitude: number; longitude: number; category: { nameNp: string; icon?: string } }
type Boundary = { id: string; name: string; wardNumber?: number; geoJson: { type: string; coordinates?: unknown; geometry?: { type: string; coordinates: unknown } } }
type Point = [number, number]
type Route = { distanceMeters: number; durationSeconds: number; geometry: { coordinates: [number, number][] }; steps: { instruction: string; name: string }[] }
const base = '/api/map'
const api = async <T,>(url: string, init?: RequestInit): Promise<T> => { const response = await fetch(url, init); if (!response.ok) { const body = await response.json().catch(() => ({})) as { message?: string }; throw new Error(body.message || `Request failed (${response.status})`) } return response.json() as Promise<T> }
const validPoint = (place: Place): place is Place & { latitude: number; longitude: number } => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)

export function ExploreMapPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [boundaries, setBoundaries] = useState<Boundary[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [ward, setWard] = useState('')
  const [selected, setSelected] = useState<Place | Appeal | null>(null)
  const [center, setCenter] = useState<Point | null>(() => {
    const lat = Number(import.meta.env.VITE_MAP_CENTER_LAT); const lon = Number(import.meta.env.VITE_MAP_CENTER_LON)
    return Number.isFinite(lat) && Number.isFinite(lon) && (lat !== 0 || lon !== 0) ? [lat, lon] : null
  })
  const [zoom, setZoom] = useState(13)
  const [layer, setLayer] = useState('street')
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [origin, setOrigin] = useState<Point | null>(null)
  const [route, setRoute] = useState<Route | null>(null)
  const [routeBusy, setRouteBusy] = useState(false)
  const [routeError, setRouteError] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)
  const [size, setSize] = useState({ width: 900, height: 600 })
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const ignoreNextClick = useRef(false)

  const refresh = useCallback(async () => {
    setBusy(true); setError('')
    try {
      const [placeRows, categoryRows, appealRows, boundaryRows] = await Promise.all([
        api<Place[]>(`${base}/places`), api<Category[]>(`${base}/categories`), api<Appeal[]>(`${base}/appeals`), api<Boundary[]>(`${base}/boundaries`),
      ])
      setPlaces(placeRows); setCategories(categoryRows); setAppeals(appealRows); setBoundaries(boundaryRows)
      const first = [...placeRows.filter(validPoint), ...appealRows].find((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
      if (first) setCenter((current) => current ?? [Number(first.latitude), Number(first.longitude)])
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }, [])
  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => {
    const el = mapRef.current; if (!el) return
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(el); return () => observer.disconnect()
  }, [])

  const filtered = useMemo(() => places.filter((place): place is Place & { latitude: number; longitude: number } => validPoint(place) && (!category || place.category.slug === category) && (!ward || place.wardNumber === Number(ward)) && (!query.trim() || `${place.nameNp} ${place.nameEn ?? ''} ${place.address ?? ''} ${place.category.nameNp}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))), [places, category, ward, query])
  const visibleAppeals = useMemo(() => appeals.filter((item) => !ward || Number(item.wardId) === Number(ward)), [appeals, ward])
  const mapCenter = center
  const projection = useMemo(() => {
    if (!mapCenter) return null
    const scale = 256 * 2 ** zoom
    const worldX = (lon: number) => (lon + 180) / 360 * scale
    const worldY = (lat: number) => { const sin = Math.sin(Math.max(-85.0511, Math.min(85.0511, lat)) * Math.PI / 180); return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale }
    const centerX = worldX(mapCenter[1]); const centerY = worldY(mapCenter[0])
    return { scale, centerX, centerY, xy: (lat: number, lon: number): [number, number] => [worldX(lon) - centerX + size.width / 2, worldY(lat) - centerY + size.height / 2], ll: (x: number, y: number): Point => { const wx = centerX + x - size.width / 2; const wy = centerY + y - size.height / 2; const lon = wx / scale * 360 - 180; const n = Math.PI - 2 * Math.PI * wy / scale; return [180 / Math.PI * Math.atan(Math.sinh(n)), lon] } }
  }, [mapCenter, zoom, size])

  const tiles = useMemo(() => {
    if (!projection) return []
    const z = Math.min(19, Math.max(0, zoom)); const n = 2 ** z; const left = projection.centerX - size.width / 2; const top = projection.centerY - size.height / 2
    const minX = Math.floor(left / 256); const maxX = Math.floor((left + size.width) / 256); const minY = Math.floor(top / 256); const maxY = Math.floor((top + size.height) / 256)
    const source = layer === 'satellite' ? import.meta.env.VITE_MAP_SATELLITE_TILE_URL : layer === 'terrain' ? import.meta.env.VITE_MAP_TERRAIN_TILE_URL : import.meta.env.VITE_MAP_STREET_TILE_URL
    if (layer !== 'street' && !source) return []
    return Array.from({ length: (maxX - minX + 1) * (maxY - minY + 1) }, (_, index) => { const x = minX + index % (maxX - minX + 1); const y = minY + Math.floor(index / (maxX - minX + 1)); const wrapped = (x % n + n) % n; const tileSource = source || (layer === 'street' ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' : ''); const url = String(tileSource).replace('{z}', String(z)).replace('{x}', String(wrapped)).replace('{y}', String(y)); return { key: `${z}/${wrapped}/${y}`, url, left: x * 256 - projection.centerX + size.width / 2, top: y * 256 - projection.centerY + size.height / 2, y, n } }).filter((tile) => tile.y >= 0 && tile.y < tile.n)
  }, [projection, size, zoom, layer])

  const markerPlaces = filtered
  const requestDirections = async () => {
    const destination: Point | null = selected && Number.isFinite(selected.latitude) && Number.isFinite(selected.longitude) ? [Number(selected.latitude), Number(selected.longitude)] : null
    if (!origin || !destination) { setRouteError('Select a mapped destination and set your starting point first.'); return }
    setRouteBusy(true); setRouteError(''); setRoute(null)
    try { const data = await api<{ available: boolean; message?: string; distanceMeters: number; durationSeconds: number; geometry: Route['geometry']; steps: Route['steps'] }>(`${base}/directions?from=${origin[0]},${origin[1]}&to=${destination[0]},${destination[1]}&mode=driving`); if (!data.available) throw new Error(data.message || 'No route found'); setRoute(data); setCenter(destination); setZoom(Math.max(zoom, 14)) } catch (e) { setRouteError((e as Error).message) } finally { setRouteBusy(false) }
  }
  const locate = () => {
    if (!navigator.geolocation) { setError('Location is not supported by this browser.'); return }
    setLocating(true); navigator.geolocation.getCurrentPosition(({ coords }) => { const point: Point = [coords.latitude, coords.longitude]; setOrigin(point); setCenter(point); setZoom(15); setLocating(false) }, (e) => { setError(e.code === e.PERMISSION_DENIED ? 'Location permission was denied.' : 'Could not determine your current location.'); setLocating(false) }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 })
  }
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY, moved: false } }
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => { const start = drag.current; if (!start || !projection) return; const dx = event.clientX - start.x; const dy = event.clientY - start.y; if (Math.abs(dx) + Math.abs(dy) > 4) { start.moved = true; ignoreNextClick.current = true; setCenter(projection.ll(size.width / 2 - dx, size.height / 2 - dy)) } drag.current = null }
  const recenter = () => { const first = [...places.filter(validPoint), ...appeals].find((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)); if (first) { setCenter([Number(first.latitude), Number(first.longitude)]); setZoom(13) } }
  const selectPlace = (place: Place) => { setSelected(place); if (validPoint(place)) { setCenter([place.latitude, place.longitude]); setZoom(Math.max(zoom, 15)) }; setSuggestionsOpen(false) }

  return <div className="explore-page">
    <header className="explore-header"><a href="/" className="explore-brand"><img src="/chaurpati-emblem.svg" alt=""/><span><strong>चौरपाटी गाउँपालिका</strong><small>अछाम, सुदूरपश्चिम प्रदेश</small></span></a><nav><a href="/">गृहपृष्ठ</a><a href="/public-appeals">जनताको आवाज</a><a className="active" href="/map">▧ नक्सा हेर्नुहोस्</a><a href="https://chaurpatimun.gov.np/" target="_blank" rel="noreferrer">सम्पर्क ↗</a></nav><a className="explore-home-link" href="/">← पोर्टल</a></header>
    <section className="explore-hero"><span>CHAURPATI RURAL MUNICIPALITY · GIS</span><h1>नक्सा हेर्नुहोस्</h1><p>चौरपाटी गाउँपालिकाका प्रमाणित स्थान र सार्वजनिक सेवाहरू नक्सामा खोज्नुहोस्।</p></section>
    <main className="explore-layout">
      <aside className="explore-sidebar"><label className="explore-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => { setQuery(e.target.value); setSuggestionsOpen(true) }} onFocus={() => setSuggestionsOpen(true)} onKeyDown={(e) => { if (e.key === 'Escape') setSuggestionsOpen(false); if (e.key === 'Enter' && filtered[0]) selectPlace(filtered[0]) }} placeholder="स्थान वा सेवा खोज्नुहोस्..." aria-label="स्थान वा सेवा खोज्नुहोस्"/><button type="button" onClick={() => setQuery('')} aria-label="खोजी मेटाउनुहोस्">×</button></label>
        {suggestionsOpen && query.trim() && <div className="explore-suggestions">{filtered.slice(0, 7).map((place) => <button key={place.id} onClick={() => selectPlace(place)}><span>{place.category.icon || '●'}</span><span><strong>{place.nameNp}</strong><small>{place.category.nameNp}{place.wardNumber ? ` · वडा ${place.wardNumber}` : ''}{place.address ? ` · ${place.address}` : ''}</small></span></button>)}{!filtered.length && <p>{busy ? 'खोज्दैछ…' : 'प्रमाणित स्थान भेटिएन।'}</p>}</div>}
        <section className="explore-filters"><h2>देखाउने वर्ग</h2><button className={!category ? 'filter-chip selected' : 'filter-chip'} onClick={() => setCategory('')}>सबै स्थान</button>{categories.map((item) => <button key={item.id} className={category === item.slug ? 'filter-chip selected' : 'filter-chip'} onClick={() => setCategory(category === item.slug ? '' : item.slug)}><span>{item.icon || '•'}</span>{item.nameNp}</button>)}<label className="ward-select">वडा छान्नुहोस्<select value={ward} onChange={(e) => setWard(e.target.value)}><option value="">सबै वडा</option>{Array.from({ length: 7 }, (_, i) => <option value={i + 1} key={i + 1}>वडा नं. {i + 1}</option>)}</select></label><label className="boundary-toggle"><input type="checkbox" checked={showBoundaries} onChange={(e) => setShowBoundaries(e.target.checked)}/> उपलब्ध आधिकारिक वडा सीमा</label><small>{filtered.length + visibleAppeals.length} सार्वजनिक स्थान</small></section>
        <div className="explore-trust"><span>ⓘ</span> प्रमाणित तथा सार्वजनिक रूपमा प्रकाशित स्थान मात्र देखाइएका छन्। वडा सीमा उपलब्ध भएमा स्रोतसहित देखाइन्छ।</div>
      </aside>
      <section className="explore-map-column"><div className="explore-map" ref={mapRef} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { drag.current = null }} role="application" aria-label="चौरपाटी सार्वजनिक स्थानको नक्सा" onClick={(e) => { if (ignoreNextClick.current) { ignoreNextClick.current = false; return } if ((e.target as HTMLElement).closest('.map-controls,.map-marker,.map-attribution') || !projection) return; const rect = e.currentTarget.getBoundingClientRect(); setOrigin(projection.ll(e.clientX - rect.left, e.clientY - rect.top)) }}>
        {mapCenter && projection ? <><div className="tile-plane">{tiles.map((tile) => <img key={tile.key} draggable="false" alt="" src={tile.url} style={{ left: tile.left, top: tile.top }} onError={(e) => { e.currentTarget.style.opacity = '0' }}/>)}</div>{layer !== 'street' && !tiles.length && <div className="map-layer-unavailable">Энэ зургийн давхарга тохируулаагүй байна · This layer is not configured</div>}
          <svg className="map-overlay" width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`}>
            {showBoundaries && boundaries.map((boundary) => <BoundaryShape key={boundary.id} boundary={boundary} project={projection.xy}/>) }
            {route && <polyline className="map-route-line" points={route.geometry.coordinates.map(([lon, lat]) => projection.xy(lat, lon).join(',')).join(' ')}/>}
            {origin && <circle className="map-origin-dot" cx={projection.xy(origin[0], origin[1])[0]} cy={projection.xy(origin[0], origin[1])[1]} r="9"/>}
          </svg>
          {markerPlaces.map((place) => { const [x, y] = projection.xy(place.latitude, place.longitude); return <button key={place.id} className={`map-marker ${selected?.id === place.id ? 'active' : ''}`} style={{ left: x, top: y }} title={place.nameNp} onClick={(e) => { e.stopPropagation(); selectPlace(place) }}><span>{place.category.icon || '●'}</span></button> })}
          {visibleAppeals.map((item) => { const [x, y] = projection.xy(item.latitude, item.longitude); return <button key={item.id} className={`map-marker appeal-marker ${selected?.id === item.id ? 'active' : ''}`} style={{ left: x, top: y }} title={item.title} onClick={(e) => { e.stopPropagation(); setSelected(item) }}><span>⚑</span></button> })}
        </> : <div className="map-empty"><span>▧</span><strong>प्रमाणित स्थानको प्रतीक्षामा</strong><p>नक्सामा स्थान देखाउन व्यवस्थापकले प्रमाणित निर्देशाङ्कसहित स्थान प्रकाशित गर्नुपर्छ। वा मेरो स्थान थिच्नुहोस्।</p><button onClick={locate}>मेरो स्थान प्रयोग गर्नुहोस्</button></div>}
        <div className="map-controls"><button title="Zoom in" aria-label="Zoom in" onClick={() => setZoom((n) => Math.min(19, n + 1))}>+</button><button title="Zoom out" aria-label="Zoom out" onClick={() => setZoom((n) => Math.max(3, n - 1))}>−</button><button onClick={locate} disabled={locating} title="My location">◎</button><button onClick={recenter} title="Reset map view">⌖</button><button onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void mapRef.current?.requestFullscreen() }} title="Fullscreen map">⛶</button><select aria-label="Map layer" value={layer} onChange={(e) => setLayer(e.target.value)}><option value="street">नक्सा</option><option value="satellite">Satellite</option><option value="terrain">Terrain</option></select></div><a className="map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
      </div><div className="map-status">{error ? <span role="alert">{error}</span> : busy ? 'नक्सा डाटा लोड हुँदैछ…' : `${markerPlaces.length} स्थान · ${boundaries.length} प्रकाशित सीमा`}</div></section>
      <aside className="explore-detail"><div className="detail-heading"><div><span className="map-eyebrow">स्थान विवरण</span><h2>{selected ? ('supportCount' in selected ? selected.title : selected.nameNp) : 'नक्सामा स्थान छान्नुहोस्'}</h2></div>{selected && <button aria-label="Close details" onClick={() => { setSelected(null); setRoute(null) }}>×</button>}</div>
        {selected && ('supportCount' in selected ? <><p className="detail-category">⚑ जनताको आवाज · वडा नं. {selected.wardId || '—'}</p><p className="detail-body">यो स्थान अनुमानित हो। व्यक्तिको पहिचान वा सम्पर्क विवरण देखाइँदैन।</p><p className="detail-meta">{selected.supportCount} समर्थन · {selected.commentCount} टिप्पणी · {selected.status}</p><a className="detail-primary" href={`/public-appeals/${selected.id}`}>निवेदन हेर्नुहोस् ↗</a></> : <><p className="detail-category">{selected.category.icon || '●'} {selected.category.nameNp}{selected.wardNumber ? ` · वडा नं. ${selected.wardNumber}` : ''}</p>{selected.imageUrl && <img className="place-photo" src={selected.imageUrl} alt={selected.nameNp} loading="lazy"/>}{selected.descriptionNp && <p className="detail-body">{selected.descriptionNp}</p>}{selected.address && <p className="detail-meta">⌖ {selected.address}</p>}{selected.phone && <p className="detail-meta">☎ {selected.phone}</p>}{selected.email && <a className="detail-meta" href={`mailto:${selected.email}`}>{selected.email}</a>}{selected.openingHours && <p className="detail-meta">◷ {selected.openingHours}</p>}{selected.sourceName && <p className="detail-verified">✓ {selected.sourceName} · प्रमाणीकरण भएको</p>}{selected.website && <a className="detail-meta" href={selected.website} target="_blank" rel="noreferrer">वेबसाइट ↗</a>}</>)}
        {selected && <div className="detail-actions"><button className="detail-primary" onClick={() => { setRoute(null); setRouteError(''); document.querySelector('.route-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }}>↗ दिशा-निर्देशन</button><button className="detail-secondary" onClick={() => { const lat = Number(selected.latitude); const lon = Number(selected.longitude); if (Number.isFinite(lat) && Number.isFinite(lon)) window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`, '_blank', 'noopener,noreferrer') }}>OpenStreetMap</button></div>}
        {selected && <section className="street-fallback"><h3>स्ट्रीट भ्यू</h3><p>यस स्थानका लागि हाल प्रमाणित स्ट्रीट भ्यू सेवा जडान गरिएको छैन।</p><button onClick={() => { const lat = Number(selected.latitude); const lon = Number(selected.longitude); if (Number.isFinite(lat) && Number.isFinite(lon)) window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`, '_blank', 'noopener,noreferrer') }}>नक्सामा हेर्नुहोस्</button></section>}
        <section className="route-panel"><h3>दिशा-निर्देशन</h3><p>बाट: {origin ? `${origin[0].toFixed(5)}, ${origin[1].toFixed(5)}` : 'मेरो स्थान छान्नुहोस् वा नक्सामा थिच्नुहोस्'}</p><div className="route-options"><button onClick={locate} disabled={locating}>◎ मेरो स्थान</button><span>🚗 कार · मार्ग सेवा अनुसार</span><span className="mode-disabled">मोटरसाइकल / हिँड्ने उपलब्ध छैन</span></div>{route && <div className="route-result"><strong>{(route.distanceMeters / 1000).toFixed(1)} km · {Math.max(1, Math.round(route.durationSeconds / 60))} मिनेट</strong><ol>{route.steps.filter((step) => step.instruction !== 'depart' && step.instruction !== 'arrive').slice(0, 8).map((step, index) => <li key={`${step.name}-${index}`}>{step.instruction}{step.name && ` · ${step.name}`}</li>)}</ol><small>OSRM मार्ग अनुमान; सडक र यातायात अवस्था फरक हुन सक्छ।</small></div>}{routeError && <p className="route-error" role="alert">{routeError}</p>}<button className="detail-primary route-button" disabled={!selected || routeBusy} onClick={() => void requestDirections()}>{routeBusy ? 'मार्ग खोज्दैछ…' : 'दिशा-निर्देशन सुरु गर्नुहोस्'}</button></section>
        <section className="detail-list"><h3>स्थानहरू {busy && '…'}</h3>{markerPlaces.slice(0, 12).map((place) => <button key={place.id} className={selected?.id === place.id ? 'selected' : ''} onClick={() => selectPlace(place)}><span>{place.category.icon || '●'}</span><span><strong>{place.nameNp}</strong><small>{place.category.nameNp}{place.wardNumber ? ` · वडा ${place.wardNumber}` : ''}</small></span></button>)}{!markerPlaces.length && !busy && <p>प्रकाशित स्थान उपलब्ध छैन।</p>}</section>
      </aside>
    </main>
  </div>
}

function BoundaryShape({ boundary, project }: { boundary: Boundary; project: (lat: number, lon: number) => [number, number] }) {
  const geo = boundary.geoJson.type === 'Feature' ? boundary.geoJson.geometry : boundary.geoJson
  const paths: number[][][] = []
  const addGeometry = (geometry: { type: string; coordinates?: unknown } | null | undefined) => {
    if (!geometry || !Array.isArray(geometry.coordinates)) return
    const coordinates = geometry.coordinates as number[][][]
    if (geometry.type === 'Polygon') coordinates.forEach((ring) => paths.push(ring))
    if (geometry.type === 'MultiPolygon') (coordinates as unknown as number[][][][]).forEach((polygon) => polygon.forEach((ring) => paths.push(ring)))
  }
  if (!geo) return null
  if (geo.type === 'FeatureCollection') (geo as Boundary['geoJson'] & { features?: Boundary['geoJson'][] }).features?.forEach((feature) => addGeometry(feature.type === 'Feature' ? feature.geometry : feature as { type: string; coordinates?: unknown }))
  else addGeometry(geo)
  return <g className="boundary-shape" aria-label={boundary.name}>{paths.map((ring, index) => <polygon key={index} points={ring.map(([lon, lat]) => project(lat, lon).join(',')).join(' ')}/>)}</g>
}

type AdminPlace = Omit<Place, 'category'> & { category: Category }
const adminStore = 'chaurpati-admin-key'
export function MapAdminView() {
  const [key, setKey] = useState(() => sessionStorage.getItem(adminStore) ?? '')
  const [draftKey, setDraftKey] = useState(key)
  const [places, setPlaces] = useState<AdminPlace[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [adminBoundaries, setAdminBoundaries] = useState<{ id: string; name: string; wardNumber?: number; isPublished: boolean; sourceName?: string; sourceUrl?: string }[]>([])
  const [editId, setEditId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [categoryForm, setCategoryForm] = useState({ slug: '', nameNp: '', nameEn: '', icon: '' })
  const [boundaryForm, setBoundaryForm] = useState({ name: '', wardNumber: '', sourceName: '', sourceUrl: '', geoJson: '', isPublished: false })
  const [form, setForm] = useState({ nameNp: '', nameEn: '', slug: '', categoryId: '', wardNumber: '', latitude: '', longitude: '', address: '', phone: '', email: '', website: '', openingHours: '', descriptionNp: '', imageUrl: '', sourceName: '', sourceUrl: '', isVerified: false, isPublished: false })
  const call = useCallback(async <T,>(url: string, init?: RequestInit) => api<T>(url, { ...init, headers: { Authorization: `Bearer ${key}`, ...(init?.headers || {}) } }), [key])
  const load = useCallback(async () => { try { const [a, b, c] = await Promise.all([call<AdminPlace[]>(`${base}/admin/places`), call<Category[]>(`${base}/admin/categories`), call<typeof adminBoundaries>(`${base}/admin/boundaries`)]); setPlaces(a); setCategories(b); setAdminBoundaries(c) } catch (e) { setError((e as Error).message) } }, [call])
  useEffect(() => { if (key) void load() }, [key, load])
  const authorize = (e: React.FormEvent) => { e.preventDefault(); sessionStorage.setItem(adminStore, draftKey); setKey(draftKey); setError('') }
  const clear = () => { setEditId(''); setForm({ nameNp: '', nameEn: '', slug: '', categoryId: categories[0]?.id || '', wardNumber: '', latitude: '', longitude: '', address: '', phone: '', email: '', website: '', openingHours: '', descriptionNp: '', imageUrl: '', sourceName: '', sourceUrl: '', isVerified: false, isPublished: false }) }
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setError(''); setMessage(''); try { await call(`${base}/admin/places${editId ? `/${editId}` : ''}`, { method: editId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, wardNumber: form.wardNumber ? Number(form.wardNumber) : null, latitude: form.latitude ? Number(form.latitude) : null, longitude: form.longitude ? Number(form.longitude) : null }) }); setMessage('स्थान सुरक्षित भयो।'); clear(); await load() } catch (err) { setError((err as Error).message) } }
  const submitCategory = async (e: React.FormEvent) => { e.preventDefault(); try { await call(`${base}/admin/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryForm) }); setCategoryForm({ slug: '', nameNp: '', nameEn: '', icon: '' }); await load() } catch (e) { setError((e as Error).message) } }
  const submitBoundary = async (e: React.FormEvent) => { e.preventDefault(); try { await call(`${base}/admin/boundaries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...boundaryForm, wardNumber: boundaryForm.wardNumber ? Number(boundaryForm.wardNumber) : undefined }) }); setBoundaryForm({ name: '', wardNumber: '', sourceName: '', sourceUrl: '', geoJson: '', isPublished: false }); setMessage('सीमा GeoJSON सुरक्षित भयो।'); await load() } catch (e) { setError((e as Error).message) } }
  if (!key) return <div className="map-admin-shell"><form className="map-admin-form" onSubmit={authorize}><span className="map-eyebrow">GIS ADMINISTRATION</span><h2>Map place management</h2><p>Enter the backend ADMIN_API_KEY. It is kept for this browser tab only.</p><label>Admin API key<input type="password" value={draftKey} onChange={(e) => setDraftKey(e.target.value)} required autoComplete="current-password"/></label><button className="detail-primary">Continue</button>{error && <p role="alert">{error}</p>}</form></div>
  return <div className="map-admin-shell"><div className="map-admin-head"><div><span className="map-eyebrow">GIS MANAGEMENT</span><h2>Verified map places</h2><p>Only published and verified places appear on the public map.</p></div><button className="detail-secondary" onClick={() => { sessionStorage.removeItem(adminStore); setKey(''); setDraftKey('') }}>Sign out</button></div>{error && <p className="map-admin-error" role="alert">{error}</p>}{message && <p className="map-admin-success" role="status">{message}</p>}
    <form className="map-admin-form map-admin-grid" onSubmit={(e) => void submit(e)}><h3>{editId ? 'Edit place' : 'Add a place'}</h3><label>Nepali name *<input required value={form.nameNp} onChange={(e) => setForm({ ...form, nameNp: e.target.value })}/></label><label>English name<input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}/></label><label>Slug<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="generated from name if blank"/></label><label>Category *<select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.nameNp} · {c.nameEn}</option>)}</select></label><label>Ward<select value={form.wardNumber} onChange={(e) => setForm({ ...form, wardNumber: e.target.value })}><option value="">Not specified</option>{Array.from({ length: 7 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label><label>Latitude<input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}/></label><label>Longitude<input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}/></label><label>Address<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}/></label><label>Public phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/></label><label>Public email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></label><label>Official website<input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}/></label><label>Opening hours<input value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })}/></label><label>Photo URL<input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}/></label><label>Upload official photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const data = new FormData(); data.set('file', file); try { const result = await call<{ url: string }>(`${base}/admin/upload`, { method: 'POST', body: data }); setForm((current) => ({ ...current, imageUrl: result.url })); setMessage('Photo uploaded.') } catch (err) { setError((err as Error).message) } }}/></label><label>Source name *<input value={form.sourceName} onChange={(e) => setForm({ ...form, sourceName: e.target.value })} required={form.isVerified}/></label><label>Source URL *<input type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} required={form.isVerified}/></label><label className="wide">Description<textarea value={form.descriptionNp} onChange={(e) => setForm({ ...form, descriptionNp: e.target.value })}/></label><label className="map-admin-check"><input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}/> Verified from the stated source</label><label className="map-admin-check"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}/> Publish on the public map</label><div className="map-admin-actions"><button className="detail-primary">{editId ? 'Save changes' : 'Save place'}</button>{editId && <button type="button" className="detail-secondary" onClick={clear}>Cancel edit</button>}</div></form>
    <form className="map-admin-form map-admin-grid" onSubmit={(e) => void submitCategory(e)}><h3>Place categories</h3><label>Nepali label<input required value={categoryForm.nameNp} onChange={(e) => setCategoryForm({ ...categoryForm, nameNp: e.target.value })}/></label><label>English label<input required value={categoryForm.nameEn} onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}/></label><label>Slug<input required pattern="[a-z0-9-]{2,60}" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} placeholder="schools"/></label><label>Icon (emoji)<input maxLength={12} value={categoryForm.icon} onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}/></label><button className="detail-primary">Add category</button><p className="wide">Categories appear publicly when they contain verified, published places.</p></form>
    <form className="map-admin-form map-admin-grid" onSubmit={(e) => void submitBoundary(e)}><h3>Import an official boundary GeoJSON</h3><label>Name<input required value={boundaryForm.name} onChange={(e) => setBoundaryForm({ ...boundaryForm, name: e.target.value })}/></label><label>Ward number (leave blank for municipality)<select value={boundaryForm.wardNumber} onChange={(e) => setBoundaryForm({ ...boundaryForm, wardNumber: e.target.value })}><option value="">Municipal boundary</option>{Array.from({ length: 7 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label><label>Source name<input value={boundaryForm.sourceName} onChange={(e) => setBoundaryForm({ ...boundaryForm, sourceName: e.target.value })}/></label><label>Source URL<input type="url" value={boundaryForm.sourceUrl} onChange={(e) => setBoundaryForm({ ...boundaryForm, sourceUrl: e.target.value })}/></label><label className="wide">GeoJSON (FeatureCollection, Feature, Polygon or MultiPolygon)<textarea required value={boundaryForm.geoJson} onChange={(e) => setBoundaryForm({ ...boundaryForm, geoJson: e.target.value })}/></label><label className="map-admin-check"><input type="checkbox" checked={boundaryForm.isPublished} onChange={(e) => setBoundaryForm({ ...boundaryForm, isPublished: e.target.checked })}/> Publish boundary (source required)</label><button className="detail-primary">Save GeoJSON</button></form>
    <section className="map-admin-list"><h3>Places in database ({places.length})</h3>{places.map((place) => <article key={place.id}><div><strong>{place.nameNp}</strong><small>{place.category.nameNp} · {place.wardNumber ? `Ward ${place.wardNumber}` : 'Ward unspecified'} · {place.isVerified ? 'Verified' : 'Unverified'} · {place.isPublished ? 'Published' : 'Draft'}</small></div><button onClick={() => { setEditId(place.id); setForm({ nameNp: place.nameNp, nameEn: place.nameEn || '', slug: place.slug, categoryId: place.categoryId, wardNumber: place.wardNumber ? String(place.wardNumber) : '', latitude: place.latitude == null ? '' : String(place.latitude), longitude: place.longitude == null ? '' : String(place.longitude), address: place.address || '', phone: place.phone || '', email: place.email || '', website: place.website || '', openingHours: place.openingHours || '', descriptionNp: place.descriptionNp || '', imageUrl: place.imageUrl || '', sourceName: place.sourceName || '', sourceUrl: place.sourceUrl || '', isVerified: place.isVerified, isPublished: Boolean(place.isPublished) }) }}>Edit</button><button onClick={async () => { if (!window.confirm(`Delete ${place.nameNp}?`)) return; try { await call(`${base}/admin/places/${place.id}`, { method: 'DELETE' }); await load() } catch (e) { setError((e as Error).message) } }}>Delete</button></article>)}</section>
    <section className="map-admin-list"><h3>Imported boundaries ({adminBoundaries.length})</h3>{adminBoundaries.map((boundary) => <article key={boundary.id}><div><strong>{boundary.name}</strong><small>{boundary.wardNumber ? `Ward ${boundary.wardNumber}` : 'Municipal boundary'} · {boundary.isPublished ? 'Published' : 'Draft'} · {boundary.sourceName || 'No source'}</small></div></article>)}{!adminBoundaries.length && <p>No boundary files imported yet.</p>}</section>
  </div>
}

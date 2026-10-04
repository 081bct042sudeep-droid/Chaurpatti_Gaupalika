import { useEffect, useState } from 'react'
import type { Appeal } from './appeals'

export function AppealsHomeSection() {
  const [items, setItems] = useState<Appeal[]>([])
  const [error, setError] = useState(false)
  useEffect(() => { fetch('/api/v1/public-appeals?sort=support&limit=4').then((response) => { if (!response.ok) throw new Error('Unavailable'); return response.json() }).then((data: { items?: Appeal[] }) => setItems(data.items ?? [])).catch(() => setError(true)) }, [])
  return <section className="appeals-home-section" id="appeals"><header><div><span className="reference-kicker">नागरिक सहभागिता</span><h2>जनताको आवाज</h2><p>तपाईंको समस्या, सुझाव र आवाज सम्बन्धित निकायसम्म पुर्‍याऔं।</p></div><a href="/public-appeals">सबै आवाज हेर्नुहोस् →</a></header>{items.length === 0 ? <div className="appeals-home-empty"><p>{error ? 'निवेदनहरू अहिले लोड गर्न सकिएन।' : 'अहिले कुनै सार्वजनिक समस्या वा सुझाव प्रकाशित गरिएको छैन।'}</p><a href="/public-appeals/create">समस्या/सुझाव राख्नुहोस्</a></div> : <div className="appeals-home-grid">{items.map((item) => <a className="appeal-home-card" href={`/public-appeals/${item.id}`} key={item.id}><span>{item.category?.icon} {item.category?.nameNp}</span><h3>{item.title}</h3><p>वडा नं. {item.wardId ?? '—'} · {new Date(item.createdAt).toLocaleDateString('ne-NP')}</p><strong>{item.status === 'RESOLVED' ? '✓ समाधान भयो' : item.status === 'IN_PROGRESS' ? '◉ समाधान प्रक्रियामा' : '● प्रकाशित'}</strong><div><b>👍 {item.supportCount} समर्थन</b><small>💬 {item.commentCount} टिप्पणी</small></div><span className="home-card-detail">विस्तृत हेर्नुहोस् →</span></a>)}</div>}<a className="appeals-home-create" href="/public-appeals/create">＋ समस्या/सुझाव राख्नुहोस्</a></section>
}

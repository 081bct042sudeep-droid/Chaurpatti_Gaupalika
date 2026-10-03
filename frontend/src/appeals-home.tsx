import { useEffect, useState } from 'react'
import type { Appeal } from './appeals'

export function AppealsHomeSection() {
  const [items, setItems] = useState<Appeal[]>([])
  useEffect(() => { fetch('/api/v1/public-appeals?sort=support&limit=3').then((r) => r.json()).then((data) => setItems(data.items ?? [])).catch(() => undefined) }, [])
  return <section className="appeals-home-section" id="appeals"><header><div><span className="reference-kicker">जनताको आवाज</span><h2>तपाईंको समस्या, सुझाव र आवाज</h2></div><a href="/public-appeals">सबै आवाज हेर्नुहोस् →</a></header>{items.length === 0 ? <div className="appeals-home-empty">अहिले कुनै सार्वजनिक समस्या वा सुझाव प्रकाशित गरिएको छैन।<a href="/public-appeals/create">समस्या/सुझाव राख्नुहोस्</a></div> : <div className="appeals-home-grid">{items.map((item) => <a className="appeal-home-card" href={`/public-appeals/${item.id}`} key={item.id}><span>{item.category?.icon} {item.category?.nameNp}</span><h3>{item.title}</h3><p>वडा नं. {item.wardId ?? '—'} · {item.status}</p><strong>👍 {item.supportCount} समर्थन</strong><small>💬 {item.commentCount} टिप्पणी</small></a>)}</div>}</section>
}

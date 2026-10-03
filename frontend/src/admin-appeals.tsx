import { useEffect, useState } from 'react'
import type { Appeal } from './appeals'

export function AdminAppealsView() {
  const [items, setItems] = useState<Appeal[]>([])
  const [filter, setFilter] = useState('')
  const load = () => fetch(`/api/v1/admin/public-appeals${filter ? `?status=${filter}` : ''}`).then((r) => r.json()).then(setItems)
  useEffect(() => { load() }, [filter])
  const change = async (id: string, status: string) => { await fetch(`/api/v1/admin/public-appeals/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, note: `Status changed to ${status}` }) }); load() }
  return <div className="page-body"><div className="sync-intro"><div><span className="section-kicker">जनताको आवाज</span><h2>Public appeal management</h2><p>Review citizen problems and suggestions before public publication.</p></div><span className="status-pill large"><i />{items.length} records</span></div><div className="appeal-admin-tabs">{['', 'PENDING', 'APPROVED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((status) => <button className={filter === status ? 'active' : ''} key={status} onClick={() => setFilter(status)}>{status || 'All'}</button>)}</div><section className="admin-appeal-table">{items.length === 0 ? <div className="notice-list-empty">No appeal records found.</div> : items.map((item) => <article key={item.id}><div><span className="appeal-category">{item.category?.icon} {item.category?.nameNp}</span><h3>{item.title}</h3><p>Ward {item.wardId ?? '—'} · 👍 {item.supportCount} · 💬 {item.commentCount}</p></div><span className={`appeal-status status-${item.status.toLowerCase()}`}>{item.status}</span><div className="notice-actions"><button className="text-button" onClick={() => change(item.id, 'APPROVED')}>Approve</button><button className="text-button" onClick={() => change(item.id, 'IN_PROGRESS')}>In progress</button><button className="text-button" onClick={() => change(item.id, 'RESOLVED')}>Resolve</button></div></article>)}</section></div>
}

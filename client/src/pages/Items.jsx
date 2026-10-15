import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'

const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other']
const STATUSES = ['lost', 'found', 'claimed']

export default function Items() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const res = await api.get('/items', { params: { status: status || undefined, category: category || undefined } })
    setItems(res.data.items)
  }

  useEffect(() => { load() }, [status, category])

  async function onDelete(id) {
    setError('')
    try {
      await api.delete('/items/' + id)
      setItems(prev => prev.filter(i => i._id !== id))
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className="label" htmlFor="filter-status">Status</label>
          <select id="filter-status" className="input" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="label" htmlFor="filter-category">Category</label>
          <select id="filter-category" className="input" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {error && <div className="error">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(i => {
          const isMine = user && i.reportedBy?._id === user.id
          return (
            <div key={i._id} className="card flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-lg">{i.title}</div>
                <span className={`badge badge-${i.status}`}>{i.status}</span>
              </div>
              <div className="mt-1 text-sm text-zinc-600">
                <span className="capitalize">{i.category}</span>
                {i.location && <> • {i.location}</>} • by {i.reportedBy?.name || 'unknown'}
              </div>
              {i.description && <p className="mt-2 text-sm">{i.description}</p>}
              {isMine && (
                <div className="mt-4 pt-3 border-t border-zinc-100 flex gap-2">
                  <Link to={`/items/${i._id}`} className="btn btn-secondary">Edit</Link>
                  <button onClick={() => onDelete(i._id)} className="btn btn-danger">Delete</button>
                </div>
              )}
            </div>
          )
        })}
        {items.length === 0 && <div className="text-sm text-zinc-600">No items found.</div>}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Must match the server's Joi .valid(...) lists exactly, or it returns 400.
const STATUSES = ['lost', 'found', 'claimed']
const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other']

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }

const capitalize = s => s[0].toUpperCase() + s.slice(1)

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the item and copy its editable fields into the form.
  useEffect(() => {
    if (!id) return
    let ignore = false // set on cleanup so a late response can't overwrite the form
    api.get('/items/' + id)
      .then(res => {
        if (ignore) return
        const item = res.data.item
        setForm({
          title: item.title,
          status: item.status,
          category: item.category,
          // optional fields may be missing; '' keeps the inputs controlled
          location: item.location ?? '',
          description: item.description ?? ''
        })
      })
      .catch(err => {
        if (!ignore) setError(err?.response?.data?.message || 'Failed to load item')
      })
    return () => { ignore = true }
  }, [id])

  // Each input's `name` matches a key in `form`, so one handler serves them all.
  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // Send only these fields — never reportedBy, which the server rejects.
    const { title, status, category, location, description } = form
    const payload = { title, status, category, location, description }
    try {
      if (id) await api.patch('/items/' + id, payload)
      else await api.post('/items', payload)
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" className="input" name="title" placeholder="e.g. Black backpack" value={form.title} onChange={onChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" className="input" name="status" value={form.status} onChange={onChange}>
              {STATUSES.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="input" name="category" value={form.category} onChange={onChange}>
              {CATEGORIES.map(c => <option key={c} value={c}>{capitalize(c)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="location">Location <span className="font-normal text-zinc-400">(optional)</span></label>
          <input id="location" className="input" name="location" placeholder="e.g. Library 2nd floor" value={form.location} onChange={onChange} />
        </div>
        <div>
          <label className="label" htmlFor="description">Description <span className="font-normal text-zinc-400">(optional)</span></label>
          <textarea id="description" className="input" name="description" rows={3} value={form.description} onChange={onChange} />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit">Save</button>
          <Link to="/items" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

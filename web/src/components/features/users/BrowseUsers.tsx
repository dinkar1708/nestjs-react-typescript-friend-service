import { useState, useEffect } from 'react'
import { getUsers } from '../../../lib/users'
import { sendFriendRequest } from '../../../lib/friends'
import type { User } from '../../../lib/users'
import './BrowseUsers.css'

interface BrowseUsersProps {
  onBack: () => void
}

export function BrowseUsers({ onBack }: BrowseUsersProps) {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => load(), 300)
    return () => clearTimeout(t)
  }, [search])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await getUsers(search || undefined)
      setUsers(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(userId: string) {
    setSending(userId)
    setError('')
    try {
      await sendFriendRequest(userId)
      setUsers((u) => u.filter((x) => x.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request')
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="browse-page">
      <div className="browse-card">
        <header className="browse-header">
          <h1>Browse users</h1>
          <button className="browse-back" onClick={onBack}>
            ← Back
          </button>
        </header>

        <input
          type="search"
          className="browse-search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {error && <div className="browse-error">{error}</div>}

        {loading ? (
          <p className="browse-loading">Loading…</p>
        ) : users.length === 0 ? (
          <p className="browse-empty">No users found.</p>
        ) : (
          <ul className="browse-list">
            {users.map((u) => (
              <li key={u.id} className="browse-item">
                <div>
                  <span className="browse-name">{u.name}</span>
                  <span className="browse-email">{u.email}</span>
                </div>
                <button
                  className="browse-add"
                  onClick={() => handleAdd(u.id)}
                  disabled={sending === u.id}
                >
                  {sending === u.id ? 'Sending…' : 'Add friend'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

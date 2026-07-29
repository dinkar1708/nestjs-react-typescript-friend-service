import { useState, useEffect } from 'react'
import { getStoredUser, clearAuth } from '../../../lib/auth'
import { getFriends, getPendingReceived, acceptRequest, rejectRequest } from '../../../lib/friends'
import type { User, FriendRequest } from '../../../lib/friends'
import './Home.css'

interface HomeProps {
  onLogout: () => void
  onBrowseUsers?: () => void
  onWebRTCDemo?: () => void
}

export function Home({ onLogout, onBrowseUsers, onWebRTCDemo }: HomeProps) {
  const user = getStoredUser()
  const [friends, setFriends] = useState<User[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        getFriends(),
        getPendingReceived(),
      ])
      setFriends(friendsRes)
      setRequests(requestsRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(id: string) {
    try {
      await acceptRequest(id)
      setRequests((r) => r.filter((x) => x.id !== id))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept')
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectRequest(id)
      setRequests((r) => r.filter((x) => x.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
    }
  }

  function handleLogout() {
    clearAuth()
    onLogout()
  }

  if (loading) {
    return (
      <div className="home-page">
        <div className="home-card">
          <p className="home-loading">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="home-page">
      <div className="home-card home-dashboard">
        <header className="home-header">
          <div>
            <h1>Dashboard</h1>
            <p className="home-welcome">
              Hello, <strong>{user?.name || 'User'}</strong>
            </p>
          </div>
          <button className="home-logout" onClick={handleLogout}>
            Log out
          </button>
        </header>

        {error && <div className="home-error">{error}</div>}

        {onBrowseUsers && (
          <section className="home-section">
            <h2>Find people</h2>
            <button className="home-action" onClick={onBrowseUsers}>
              Browse users
            </button>
          </section>
        )}

        {onWebRTCDemo && (
          <section className="home-section">
            <h2>Experiments</h2>
            <button className="home-action" onClick={onWebRTCDemo}>
              WebRTC Demo
            </button>
          </section>
        )}

        {requests.length > 0 && (
          <section className="home-section">
            <h2>Friend requests</h2>
            <ul className="home-list">
              {requests.map((r) => (
                <li key={r.id} className="home-list-item">
                  <span>{r.sender?.name} ({r.sender?.email})</span>
                  <div className="home-actions">
                    <button
                      className="home-btn-accept"
                      onClick={() => handleAccept(r.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="home-btn-reject"
                      onClick={() => handleReject(r.id)}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="home-section">
          <h2>Friends ({friends.length})</h2>
          {friends.length === 0 ? (
            <p className="home-empty">No friends yet. Browse users to add friends.</p>
          ) : (
            <ul className="home-list">
              {friends.map((f) => (
                <li key={f.id} className="home-list-item">
                  {f.name} <span className="home-email">{f.email}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

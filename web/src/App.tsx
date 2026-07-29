import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { isLoggedIn } from './lib/auth'
import { Login } from './components/features/auth/Login'
import { Register } from './components/features/auth/Register'
import { Home } from './components/features/friends/Home'
import { BrowseUsers } from './components/features/users/BrowseUsers'
import { WebRTCDemo } from './components/features/webrtc/WebRTCDemo'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { PrivateRoute } from './components/common/PrivateRoute'
import './App.css'

function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isLoggedIn() ? '/home' : '/login')
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <main className="welcome splash">
      <div className="welcome-card">
        <h1>Welcome</h1>
        <p className="project">NestConnect</p>
        <p className="tagline">Social networking and chat</p>
      </div>
    </main>
  )
}

function LoginWrapper() {
  const navigate = useNavigate()
  return (
    <Login
      onSuccess={() => navigate('/home')}
      onGoRegister={() => navigate('/register')}
    />
  )
}

function RegisterWrapper() {
  const navigate = useNavigate()
  return (
    <Register
      onSuccess={() => navigate('/home')}
      onGoLogin={() => navigate('/login')}
    />
  )
}

function HomeWrapper() {
  const navigate = useNavigate()
  return (
    <Home
      onLogout={() => navigate('/login')}
      onBrowseUsers={() => navigate('/browse')}
      onWebRTCDemo={() => navigate('/webrtc')}
    />
  )
}

function BrowseWrapper() {
  const navigate = useNavigate()
  return <BrowseUsers onBack={() => navigate('/home')} />
}

function WebRTCWrapper() {
  const navigate = useNavigate()
  return <WebRTCDemo onBack={() => navigate('/home')} />
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/register" element={<RegisterWrapper />} />
          <Route path="/home" element={<PrivateRoute><HomeWrapper /></PrivateRoute>} />
          <Route path="/browse" element={<PrivateRoute><BrowseWrapper /></PrivateRoute>} />
          <Route path="/webrtc" element={<PrivateRoute><WebRTCWrapper /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

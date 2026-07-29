import { useEffect, useRef, useState } from 'react'
import './WebRTCDemo.css'

interface WebRTCDemoProps {
  onBack: () => void
}

type Phase = 'idle' | 'ready' | 'connecting' | 'connected' | 'ended' | 'error'

const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
}

export function WebRTCDemo({ onBack }: WebRTCDemoProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const pc1Ref = useRef<RTCPeerConnection | null>(null)
  const pc2Ref = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState('')
  const [log, setLog] = useState<string[]>([])
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  function pushLog(line: string) {
    const stamped = `${new Date().toLocaleTimeString()}  ${line}`
    console.log('[webrtc-demo]', line)
    setLog((l) => [...l, stamped])
  }

  useEffect(() => {
    return () => {
      pc1Ref.current?.close()
      pc2Ref.current?.close()
      pc1Ref.current = null
      pc2Ref.current = null
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
  }, [])

  async function start() {
    setError('')
    setLog([])
    try {
      pushLog('getUserMedia({ video, audio })')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setPhase('ready')
      pushLog(`local tracks: ${stream.getTracks().map((t) => t.kind).join(', ')}`)
    } catch (err) {
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Failed to get media')
    }
  }

  async function connect() {
    if (!localStreamRef.current) return
    setPhase('connecting')
    try {
      const pc1 = new RTCPeerConnection(rtcConfig)
      const pc2 = new RTCPeerConnection(rtcConfig)
      pc1Ref.current = pc1
      pc2Ref.current = pc2

      pc1.onicecandidate = (e) => {
        if (e.candidate) {
          pushLog(`pc1 → pc2 ICE: ${shortCand(e.candidate)}`)
          pc2.addIceCandidate(e.candidate).catch(() => {})
        }
      }
      pc2.onicecandidate = (e) => {
        if (e.candidate) {
          pushLog(`pc2 → pc1 ICE: ${shortCand(e.candidate)}`)
          pc1.addIceCandidate(e.candidate).catch(() => {})
        }
      }

      pc1.onconnectionstatechange = () => {
        pushLog(`pc1 state: ${pc1.connectionState}`)
        if (pc1.connectionState === 'connected') setPhase('connected')
        if (pc1.connectionState === 'failed') setPhase('error')
      }

      pc2.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0]
          pushLog(`pc2 ontrack: ${e.track.kind}`)
        }
      }

      localStreamRef.current.getTracks().forEach((t) => {
        pc1.addTrack(t, localStreamRef.current!)
      })

      pushLog('pc1.createOffer()')
      const offer = await pc1.createOffer()
      await pc1.setLocalDescription(offer)
      pushLog(`SDP offer: ${offer.sdp?.split('\n').length} lines`)

      await pc2.setRemoteDescription(offer)
      pushLog('pc2.createAnswer()')
      const answer = await pc2.createAnswer()
      await pc2.setLocalDescription(answer)
      await pc1.setRemoteDescription(answer)
      pushLog(`SDP answer: ${answer.sdp?.split('\n').length} lines`)
    } catch (err) {
      setPhase('error')
      setError(err instanceof Error ? err.message : 'Failed to connect')
    }
  }

  function hangup() {
    teardown()
    setPhase('ended')
    pushLog('hangup')
  }

  function teardown() {
    pc1Ref.current?.close()
    pc2Ref.current?.close()
    pc1Ref.current = null
    pc2Ref.current = null
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
  }

  function toggleMic() {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMicOn(track.enabled)
  }

  function toggleCam() {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setCamOn(track.enabled)
  }

  return (
    <div className="rtc-page">
      <div className="rtc-card">
        <header className="rtc-header">
          <div>
            <h1>WebRTC Demo</h1>
            <p className="rtc-subtitle">
              Raw <code>RTCPeerConnection</code> loopback — no server, no SDK
            </p>
          </div>
          <button className="rtc-back" onClick={onBack}>
            Back
          </button>
        </header>

        {error && <div className="rtc-error">{error}</div>}

        <section className="rtc-videos">
          <div className="rtc-video-wrap">
            <video ref={localVideoRef} autoPlay playsInline muted />
            <span className="rtc-video-label">Local (you)</span>
          </div>
          <div className="rtc-video-wrap">
            <video ref={remoteVideoRef} autoPlay playsInline />
            <span className="rtc-video-label">Remote (loopback via pc2)</span>
          </div>
        </section>

        <section className="rtc-controls">
          {phase === 'idle' && (
            <button className="rtc-btn rtc-btn-primary" onClick={start}>
              1. Start camera
            </button>
          )}

          {phase === 'ready' && (
            <button className="rtc-btn rtc-btn-primary" onClick={connect}>
              2. Connect peers
            </button>
          )}

          {(phase === 'connecting' || phase === 'connected') && (
            <>
              <button className="rtc-btn" onClick={toggleMic}>
                {micOn ? 'Mute mic' : 'Unmute mic'}
              </button>
              <button className="rtc-btn" onClick={toggleCam}>
                {camOn ? 'Camera off' : 'Camera on'}
              </button>
              <button className="rtc-btn rtc-btn-danger" onClick={hangup}>
                Hang up
              </button>
            </>
          )}

          {(phase === 'ended' || phase === 'error') && (
            <button className="rtc-btn rtc-btn-primary" onClick={start}>
              Restart
            </button>
          )}

          <span className={`rtc-phase rtc-phase-${phase}`}>{phase}</span>
        </section>

        <section className="rtc-log">
          <h2>Signaling log</h2>
          <div className="rtc-log-body">
            {log.length === 0 ? (
              <p className="rtc-log-empty">
                Nothing yet. Click <strong>Start camera</strong> then{' '}
                <strong>Connect peers</strong>.
              </p>
            ) : (
              log.map((line, i) => (
                <div key={i} className="rtc-log-line">
                  {line}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rtc-note">
          <p>
            <strong>What this shows:</strong> two <code>RTCPeerConnection</code>s
            in the same tab exchange an SDP offer/answer and ICE candidates
            in-process. Media is captured with <code>getUserMedia</code>, sent
            through <code>pc1</code>, and received on <code>pc2</code>. Phase 1
            of NestConnect replaces the in-process signaling with a Socket.io
            gateway between two browsers.
          </p>
        </section>
      </div>
    </div>
  )
}

function shortCand(c: RTCIceCandidate): string {
  const type = c.candidate.match(/typ (\w+)/)?.[1] ?? '?'
  const proto = c.candidate.match(/(udp|tcp)/i)?.[1] ?? '?'
  return `${type} ${proto}`
}

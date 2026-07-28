# WebRTC Demo

Experimental WebRTC implementation using raw browser APIs.

## Overview

The WebRTC Demo is a learning example that demonstrates peer-to-peer video/audio communication using raw browser WebRTC APIs without any third-party SDK (no Agora, Twilio, Daily, or LiveKit).

## Features

| Feature | Backend | Web | Mobile |
|---------|---------|-----|--------|
| Local camera access | Not applicable | Done | Planned |
| Peer connection setup | Not applicable | Done | Planned |
| SDP offer/answer | Not applicable | Done | Planned |
| ICE candidate exchange | Not applicable | Done | Planned |
| Loopback video demo | Not applicable | Done | Planned |
| Signaling log viewer | Not applicable | Done | Planned |

## Purpose

This is a **learning and testing tool** to understand WebRTC fundamentals:
- How `getUserMedia` works
- How to create `RTCPeerConnection`
- SDP (Session Description Protocol) negotiation
- ICE (Interactive Connectivity Establishment) candidate gathering
- Media stream handling

**Not intended for production use** - it's a loopback demo (both peers in same browser tab).

## Web Implementation

**Location:** `web/src/pages/WebRTCDemoPage.tsx`

### Architecture

**Loopback Design:**
- Creates two `RTCPeerConnection` instances in the same browser tab
- `localPeerConnection` (caller) → `remotePeerConnection` (receiver)
- Simulates real peer-to-peer connection without a signaling server
- Manually passes SDP and ICE candidates between the two peers

### Components

1. **Local Video** - Shows your camera feed (via `getUserMedia`)
2. **Remote Video** - Shows the received video stream (loopback from local)
3. **Signaling Log** - Real-time log of WebRTC events and state changes

### WebRTC Flow

```
1. getUserMedia() → Get camera/mic access
   ↓
2. Create localPeerConnection and remotePeerConnection
   ↓
3. Add local stream tracks to localPeerConnection
   ↓
4. localPeerConnection.createOffer()
   ↓
5. localPeerConnection.setLocalDescription(offer)
   ↓
6. remotePeerConnection.setRemoteDescription(offer)
   ↓
7. remotePeerConnection.createAnswer()
   ↓
8. remotePeerConnection.setLocalDescription(answer)
   ↓
9. localPeerConnection.setRemoteDescription(answer)
   ↓
10. Exchange ICE candidates (trickle ICE)
   ↓
11. Connection established → Media flows
```

### Signaling Log Features

The log displays:
- **SDP Offer/Answer:** Line counts and type
- **ICE Candidates:** Type (host, srflx, relay), protocol, port
- **Connection State:** New, checking, connected, completed, failed
- **Timestamps:** For debugging timing issues

**Example Log Output:**
```
[10:30:45] Local stream obtained
[10:30:45] Peer connections created
[10:30:45] Local tracks added
[10:30:46] Offer created (34 lines)
[10:30:46] Local description set (offer)
[10:30:46] Remote description set (offer)
[10:30:46] Answer created (34 lines)
[10:30:46] Remote description set (answer)
[10:30:46] ICE candidate: host UDP 192.168.1.5:54321
[10:30:46] ICE candidate: srflx UDP 203.0.113.42:54321
[10:30:47] Connection state: connected
```

### Browser Compatibility

Tested on Chrome/Edge, Firefox, Safari.

Requirements: Modern browser with WebRTC support, camera/mic access, HTTPS or localhost

## Testing

**E2E Tests:** `web/e2e/webrtc-demo.spec.ts`
- Page renders correctly
- Camera permission request
- Local video stream starts
- Remote video receives media
- Signaling log shows expected events
- Connection state reaches "connected"

Run tests: `cd web && npm run test:e2e`

Tests verify actual media flow, not just SDP exchange.

## How to Use

1. **Navigate to WebRTC Demo:**
   - Home → Experiments → WebRTC Demo

2. **Grant Permissions:**
   - Browser will request camera/microphone access
   - Click "Allow" to proceed

3. **Observe the Demo:**
   - **Left video:** Your camera feed (local)
   - **Right video:** Loopback feed (simulated remote peer)
   - **Bottom log:** Real-time WebRTC signaling events

4. **What You'll See:**
   - Your video appears in both boxes (loopback)
   - Signaling log shows SDP exchange and ICE candidates
   - Connection state transitions to "connected"

## Educational Value

**Demonstrates:**
- Raw WebRTC API usage (no SDK abstractions)
- SDP offer/answer negotiation
- ICE candidate gathering and exchange
- Media stream handling
- Connection state lifecycle

**Does not cover:**
- Real signaling server
- Network traversal (NAT/firewall)
- TURN server fallback
- Multi-peer connections
- Data channels
- Screen sharing

## Limitations

1. **Loopback only** - Both peers in same browser tab
2. **No signaling server** - SDP/ICE passed directly between connections
3. **No real network traversal** - No STUN/TURN servers
4. **Single peer** - Cannot connect to external devices
5. **No data channels** - Video/audio only
6. **No screen sharing** - Camera feed only

## Next Steps for Real Implementation

To build a production WebRTC app:

1. **Add Signaling Server:**
   - Use WebSocket server (Socket.io, SignalR, or custom)
   - Exchange SDP and ICE candidates between clients
   - Backend already has Socket.io (chat module can be extended)

2. **Add STUN/TURN Servers:**
   - STUN for NAT traversal
   - TURN for relay when direct connection fails
   - Free STUN: `stun:stun.l.google.com:19302`
   - TURN: Self-hosted (coturn) or service (Twilio, Xirsys)

3. **Multi-Peer Support:**
   - Mesh (each peer connects to all others)
   - SFU (Selective Forwarding Unit) - recommended
   - MCU (Multipoint Control Unit) - expensive

4. **Production Libraries (Optional):**
   - **Simple WebRTC** - Abstraction over raw APIs
   - **PeerJS** - Simplified peer-to-peer
   - **MediaSoup** - SFU server
   - Or use SDK: Agora, Twilio, Daily, LiveKit

## Detailed Documentation

For complete implementation details, test output, and line-by-line analysis:

See [**WEBRTC_DEMO.md**](../WEBRTC_DEMO.md) in the main docs folder.

## Related Documentation

- [Chat](./chat.md) - Real-time messaging (could be extended for signaling)
- [WebRTC Full Documentation](../WEBRTC_DEMO.md)
- [Web Frontend Guide](../interfaces/web/README.md)

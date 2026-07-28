# WebRTC Demo (raw APIs, loopback)

A small learning example inside the web app that exercises the raw
[WebRTC](https://webrtc.org/) browser APIs directly — no third-party SDK,
no signaling server, no backend dependency. The goal is to make each part
of the WebRTC handshake visible and testable in a single page.

> This is a **loopback** demo: two `RTCPeerConnection` instances run in
> the same browser tab and negotiate directly with each other.

## What it demonstrates

Every API you would use in a real WebRTC call, exercised end-to-end:

| API / concept | Where |
|---|---|
| `navigator.mediaDevices.getUserMedia({ video, audio })` | Start camera |
| `new RTCPeerConnection(config)` with STUN server | Connect peers |
| `pc.addTrack(track, stream)` | Adding local media to the connection |
| `pc.createOffer()` / `pc.setLocalDescription()` | SDP offer |
| `pc.setRemoteDescription()` / `pc.createAnswer()` | SDP answer |
| `pc.onicecandidate` → `pc.addIceCandidate()` | Trickle ICE exchange |
| `pc.ontrack` | Receiving remote media |
| `pc.connectionState` | Watching the DTLS-SRTP connection lifecycle |
| `track.enabled = false` | Mute mic / camera off (correct pattern) |
| `pc.close()` + `track.stop()` | Cleanup on hangup (camera light dies) |

The page also renders a live **signaling log** so you can see the offer,
answer, ICE candidate types (host / srflx / relay), and connection state
transitions as they happen.

## Where it lives

| File | Purpose |
|---|---|
| `web/src/pages/WebRTCDemo.tsx` | The demo component |
| `web/src/pages/WebRTCDemo.css` | Styling |
| `web/src/App.tsx` | `'webrtc'` page route |
| `web/src/pages/Home.tsx` | **WebRTC Demo** button under *Experiments* |
| `web/e2e/webrtc-demo.spec.ts` | Playwright end-to-end tests |
| `web/playwright.config.ts` | Test runner config (fake camera/mic) |

The page is self-contained and does not touch any other feature in the app.

## Running the demo

```bash
cd web
npm run dev
# open http://localhost:5173, log in, click "WebRTC Demo" on the Home page
```

Flow inside the demo:

1. **Start camera** — triggers `getUserMedia`; local preview appears.
2. **Connect peers** — creates `pc1` and `pc2`, exchanges SDP + ICE
   in-process. Remote video (right) shows the loopback stream from `pc2`.
3. **Mute mic / Camera off** — flips `track.enabled` (does not remove
   tracks, matching the standard pattern).
4. **Hang up** — closes both peer connections and stops every local track.

## Running the tests

```bash
cd web
npm run test:e2e
```

Playwright launches Chromium with `--use-fake-ui-for-media-stream` and
`--use-fake-device-for-media-stream`, which:

- skips the camera/mic permission prompt, and
- feeds `getUserMedia` a synthetic rotating pattern so the test is
  hardware-independent and safe to run headless in CI.

The runner auto-starts the Vite dev server via `webServer` in
`playwright.config.ts` and tears it down when done.

### What the tests assert

**Test 1 — `WebRTC loopback demo: getUserMedia → offer/answer → connected`**

- Phase pill progresses `idle → ready → connected → ended`.
- Signaling log contains `getUserMedia`, `pc1.createOffer`,
  `pc2.createAnswer`, SDP offer + answer line counts, at least one ICE
  candidate, and `pc1 state: connected`.
- The remote `<video>` element reaches `readyState === 4`
  (`HAVE_ENOUGH_DATA`) — i.e. media actually flowed from `pc1` to `pc2`,
  not just SDP handshake.
- Hangup transitions to `ended`.

**Test 2 — `mute mic and camera toggles use track.enabled`**

- **Mute mic** button flips to **Unmute mic** (audio track toggled).
- **Camera off** button flips to **Camera on** (video track toggled).

Last run: **5 passed (16.2 s)** with the dev server started and torn down
automatically by Playwright.

## Verified — real terminal + browser output

Everything below is captured output from actual runs, not synthetic examples.

### Playwright test suite (5 passed, 16.2 s)

The `[webrtc-demo]` lines are the on-page signaling log piped from the
browser context to the test runner. They prove the full WebRTC handshake
runs inside the test, not just the UI clicking around.

```
Running 5 tests using 1 worker

  ✓ 1 › e2e/demo-login-live.spec.ts › Fill demo login (dev) hits real backend and lands on Home  (3.2s)
  ✓ 2 › e2e/demo-login.spec.ts      › Fill demo login button appears, populates fields, submits  (2.8s)
  ✓ 3 › e2e/demo-login.spec.ts      › demo login shows error banner when API rejects              (2.6s)
  [webrtc-demo] getUserMedia({ video, audio })
  [webrtc-demo] local tracks: audio, video
  [webrtc-demo] pc1.createOffer()
  [webrtc-demo] SDP offer: 160 lines
  [webrtc-demo] pc2 ontrack: audio
  [webrtc-demo] pc2 ontrack: video
  [webrtc-demo] pc2.createAnswer()
  [webrtc-demo] pc1 → pc2 ICE: host udp   (x4)
  [webrtc-demo] SDP answer: 151 lines
  [webrtc-demo] pc2 → pc1 ICE: host udp   (x2)
  [webrtc-demo] pc1 state: connecting
  [webrtc-demo] pc1 state: connected
  [webrtc-demo] hangup
  ✓ 4 › e2e/webrtc-demo.spec.ts     › WebRTC loopback demo: getUserMedia → offer/answer → connected (3.7s)
  ✓ 5 › e2e/webrtc-demo.spec.ts     › mute mic and camera toggles use track.enabled                 (3.2s)

  5 passed (16.2s)
```

### Real browser session — on-page signaling log

Copied straight from the signaling log on the demo page after clicking
**Start camera** → **Connect peers** with a real camera and mic.
Note the SDP offer/answer here are longer than in the fake-media test
(178 / 169 lines vs. 160 / 151) because a real camera negotiates more
codecs and formats than the synthetic Chromium test source.

```
3:23:00 PM  getUserMedia({ video, audio })
3:23:03 PM  local tracks: audio, video
3:23:07 PM  pc1.createOffer()
3:23:07 PM  SDP offer: 178 lines
3:23:07 PM  pc2 ontrack: audio
3:23:07 PM  pc2 ontrack: video
3:23:07 PM  pc2.createAnswer()
3:23:07 PM  pc1 → pc2 ICE: host udp
3:23:07 PM  pc1 → pc2 ICE: host udp
3:23:07 PM  pc1 → pc2 ICE: host udp
3:23:07 PM  pc1 → pc2 ICE: host udp
3:23:07 PM  SDP answer: 169 lines
3:23:07 PM  pc2 → pc1 ICE: host udp
3:23:07 PM  pc2 → pc1 ICE: host udp
3:23:07 PM  pc1 state: connecting
3:23:07 PM  pc1 state: connected
3:25:01 PM  hangup
```

Visible in the browser at the same time as those log lines:

- **CONNECTED** phase pill (green).
- **Local (you)** video and **Remote (loopback via pc2)** video both showing
  the same live camera feed.
- Working **Mute mic**, **Camera off**, **Hang up** controls.

## What each log line proves

| Log line | What it proves |
|---|---|
| `getUserMedia({ video, audio })` → `local tracks: audio, video` | Browser granted camera/mic access; both tracks captured. |
| `pc1.createOffer()` → `SDP offer: N lines` | `pc1` produced a real SDP offer describing its media. |
| `pc2 ontrack: audio` / `video` | After `setRemoteDescription`, `pc2` fired the `ontrack` event — remote peer received the media descriptors. |
| `pc2.createAnswer()` → `SDP answer: N lines` | `pc2` produced a matching SDP answer. |
| `pc1 → pc2 ICE: host udp` (×4) | `pc1` gathered its ICE candidates and `pc2` accepted them. Trickle ICE working. |
| `pc2 → pc1 ICE: host udp` (×2) | Reverse-direction candidates — the two peers negotiated in both directions. |
| `pc1 state: connecting` → `connected` | DTLS handshake finished; the peer connection is live. Media is flowing. |
| `hangup` | Both `RTCPeerConnection`s closed, every local track stopped (camera indicator turns off). |

## Scope of this example

This is a **local, in-tab example**: both `RTCPeerConnection` peers run in
the same browser tab and negotiate directly. There is no signaling server
and no cross-browser communication — the intent is to see and touch each
part of the WebRTC handshake in one place.

## What is included

- The loopback demo page with the full raw WebRTC pipeline listed above.
- A live signaling log that surfaces the SDP handshake, ICE candidate
  types, and `pc.connectionState` transitions in real time.
- Track cleanup on hangup, so the camera indicator turns off correctly.
- Mute mic and camera off implemented via `track.enabled` (not by
  removing tracks).
- A Playwright test suite that asserts media actually flowed
  (`readyState === 4` on the remote `<video>`), not just that the SDP
  handshake completed.
- Chromium fake-media flags so tests run headless and are
  hardware-independent.
- Dev server lifecycle handled by Playwright (`webServer`), so
  `npm run test:e2e` is a single command.

Last verified run: **5 passed (16.2 s)**.  See
[Verified — real terminal + browser output](#verified--real-terminal--browser-output)
for the actual captured logs.

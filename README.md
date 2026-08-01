# Volf

**Volf** is a cross-platform desktop app for finding videos on **YouTube** and **RuTube** and playing them in the **mpv** player, with real-time **watch-together** rooms: every participant sees the same video while play, pause, seek and playlist position stay in sync across all clients.

The player itself runs outside the browser: Volf spawns mpv as a separate window and controls it over IPC, so you get the full power of mpv (hardware decoding, yt-dlp, custom filters) with a clean search-and-room UI on top.

## Features

- 🔍 **Unified search** across YouTube and RuTube with per-source toggles in Settings
- ▶️ **Play in mpv** any video or playlist from search results, history, or a direct URL
- 👥 **Watch-together rooms**: create a room, share the code, and play/pause/seek synchronizes for everyone
- 📺 **Playlist position sync** for multi-episode playlists
- 💬 **Room chat** built into the shared viewing session
- 🕘 **Playback history** of the last 100 items
- ⚙️ **Configurable mpv arguments**, persisted locally
- 🖥️ **Cross-platform IPC**: Unix sockets on Linux/macOS, named pipes on Windows

## Architecture

Volf is a **Tauri 2** application:

- **Frontend**: React 19 + TypeScript + Vite 7 + Tailwind CSS 4, with a Radix-based UI kit (shadcn-style components).
- **Backend**: Rust (Tauri commands) that spawns mpv and communicates with it over its JSON IPC interface.
- **mpv monitoring**: a Rust thread polls `time-pos`, `pause` and `playlist-pos` over the mpv socket and emits state changes to the frontend, which relays them to the room.
- **Sync server**: a separate Socket.IO server (default `ws://localhost:3000`) that fans out `player_command` and `chat_message` events between room participants. Rooms are identified by a short code; the room creator keeps an owner token.
- **Parsers**: pluggable per-source parsers (`youtube.ts`, `rutube.ts`); search only queries enabled sources and de-duplicates results by `source + id`.

```
┌─────────────┐   commands/events   ┌──────────────┐   Socket.IO   ┌─────────────┐
│  React UI   │ ◄────────────────► │  Rust (Tauri) │ ◄───────────► │  Sync server │
└─────────────┘                    └──────┬───────┘               └─────────────┘
                                           │ JSON IPC (unix socket / named pipe)
                                      ┌────▼───────┐
                                      │    mpv     │
                                      └────────────┘
```

## Tech stack

- [Tauri 2](https://tauri.app) / Rust (edition 2021)
- React 19, TypeScript ~5.8
- Vite 7, Tailwind CSS 4, Radix UI primitives
- [socket.io-client](https://socket.io) for room sync
- [mpv](https://mpv.io) as the external playback engine (requires yt-dlp for online streams)

## Requirements

- Node.js 20+ and [pnpm](https://pnpm.io)
- Rust stable toolchain
- System dependencies for Tauri 2 (see [tauri prerequisites](https://tauri.app/start/prerequisites/))
- **mpv** installed and available on `PATH`

## Development

```bash
pnpm install
pnpm tauri dev
```

## Building

```bash
pnpm tauri build
```

## Project structure

```
src/                        React frontend
  components/               UI components and tabs (Search, History, Settings, DualMode)
  services/                 mpv IPC client, sync client, video parsers (youtube, rutube)
  hooks/                    useMpvSync (room + player orchestration), useSettings
  utils/                    config/settings store (Tauri plugin-store)
src-tauri/                  Rust backend
  src/mpv_ipc.rs            mpv IPC commands and the mpv state monitor
  src/lib.rs                Tauri command registration
```

## License

Not specified yet.

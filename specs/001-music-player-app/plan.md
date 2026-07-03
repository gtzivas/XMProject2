# Implementation Plan: Music Player App

**Branch**: `001-music-player-app` | **Date**: 2026-07-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-music-player-app/spec.md`

## Summary

A web music player app (runs in modern desktop browsers) that lets the user import local
audio files from their file system, presents a browsable and searchable library, supports
playlist management, and delivers full-featured playback with background audio and browser
media key controls. Built with React + TypeScript using the HTML5 Audio API (via Howler.js)
as the audio engine and a Vite development toolchain.

Platform updated from React Native mobile (iOS + Android) to a React web app based on
user requirement change. All React Native dependencies removed; web-native equivalents
substituted throughout.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.x, Node 20 LTS (build tooling)

**Primary Dependencies**:
- `howler` 2.x — audio playback engine wrapping Web Audio API with HTML5 Audio fallback
- `music-metadata-browser` — in-browser ID3/FLAC/MP4 tag and cover art parsing
- `dexie` 3.x — IndexedDB wrapper for library index and playlists (reactive queries)
- `react-router-dom` v6 — client-side routing and navigation
- `@tanstack/react-virtual` — virtualised track lists for 10,000+ track performance
- `@dnd-kit/core` + `@dnd-kit/sortable` — accessible drag-to-reorder playlist tracks
- `zustand` — lightweight state management (playback, library, playlist state)
- Vite 5.x — fast build tooling and dev server

**Storage**: Dexie (IndexedDB) for library index and playlists; `localStorage` for
playback state persistence (current track, position, volume, shuffle/repeat)

**Testing**: Jest + React Testing Library (unit and integration); Playwright (E2E)

**Target Platform**: Chrome 100+, Edge 100+, Firefox 100+, Safari 15.4+ (modern desktop browsers)

**Project Type**: web-app (React + TypeScript, Vite)

**Performance Goals**:
- Track playback start < 2 seconds after selection
- Search across 10,000 tracks returns results < 1 second
- Library import streams incrementally (first 50 tracks visible before full import completes)

**Constraints**: Fully offline-capable; local files only (no streaming); file access via
File System Access API on Chrome/Edge with `<input type="file">` fallback for Firefox/Safari;
background audio via HTML5 Audio (continues when tab is backgrounded); Media Session API
for browser/OS media key controls (Chrome, Edge, Safari); no user accounts; cover art from
embedded file metadata only; no native mobile platform code

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Extend, Never Replace | Music player app creates new source under `src/`; no existing workflow assets modified. | ✅ |
| II. Deterministic & Auditable Outputs | Platform ambiguity flagged as NEEDS CLARIFICATION and resolved in research.md. All assumptions declared. | ✅ |
| III. Local-Repo Evidence First | spec.md and constitution.md consulted before any external reference. | ✅ |
| IV. Resilient Operations | Missing platform specification recorded as research task; planning not blocked. | ✅ |
| V. Separation of Concerns | All spec artifacts under `specs/001-music-player-app/`; source code under `src/`. | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/001-music-player-app/
├── plan.md              # This file
├── research.md          # Phase 0: platform + library decisions
├── data-model.md        # Phase 1: entities and relationships
├── quickstart.md        # Phase 1: validation guide
├── contracts/           # Phase 1: service interface contracts
│   ├── audio-player.md
│   ├── music-library.md
│   └── playlist-service.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/            # Reusable UI components
│   ├── AlbumArt/          # Cover art display with placeholder
│   ├── MediaControls/     # Play/pause/skip/seek controls bar
│   ├── ProgressBar/       # Seek bar with elapsed/remaining time
│   ├── TrackItem/         # Row component used in library + playlists
│   └── QueueItem/         # Row component for Now Playing queue
├── pages/                 # Full-page views
│   ├── LibraryPage/       # All tracks, flat virtualised list
│   ├── AlbumsPage/        # Tracks grouped by album
│   ├── ArtistsPage/       # Tracks grouped by artist
│   ├── SearchPage/        # Full-text search across library
│   ├── NowPlayingPage/    # Large album art, transport controls, queue
│   ├── PlaylistsPage/     # List of all playlists
│   ├── PlaylistDetailPage/ # Tracks inside a specific playlist
│   └── QueuePage/         # Current playback queue with reorder
├── services/              # Business logic and file integration
│   ├── AudioPlayerService/  # Wraps Howler.js; Media Session API registration
│   ├── MusicLibraryService/ # File import + Dexie index
│   └── PlaylistService/     # Playlist CRUD via Dexie
├── database/              # Dexie schema and table definitions
│   └── index.ts
├── store/                 # Zustand state slices
│   ├── playbackStore.ts   # Current track, position, volume, mode
│   ├── libraryStore.ts    # Import status, track count
│   └── playlistStore.ts   # Selected playlist, edit state
├── router/                # React Router route config
│   └── index.tsx
└── utils/                 # Format helpers, duration, file utils

tests/
├── unit/                  # Pure function and service logic tests
├── integration/           # Database + service interaction tests
└── e2e/                   # Playwright end-to-end scenarios
```

**Structure Decision**: Single React + Vite web project. No native platform folders
(`ios/`, `android/`). No backend — all data is local (IndexedDB + File System Access API).

## Complexity Tracking

*No constitution violations to justify — all principles satisfied.*

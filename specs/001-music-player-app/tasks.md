---

description: "Task list for Music Player App implementation"
---

# Tasks: Music Player App

**Input**: Design documents from `specs/001-music-player-app/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not included (no explicit TDD request in spec). Add via `/speckit.tasks` with
`--with-tests` argument when ready.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths are included in every description

---

## Path Conventions

All source code is under the repository root.

```
src/                 → application source
tests/               → unit and integration tests
specs/001-music-player-app/  → all design artifacts (do not add source code here)
```

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap the Vite + React + TypeScript project, install all dependencies,
and configure tooling. Nothing in this phase depends on feature logic.

- [ ] T001 Initialize Vite React TypeScript project: `npm create vite@latest . -- --template react-ts` at repo root; verify `src/main.tsx`, `index.html`, and `vite.config.ts` are generated
- [ ] T002 Install all npm dependencies: `howler`, `@types/howler`, `music-metadata-browser`, `dexie`, `react-router-dom`, `@tanstack/react-virtual`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `zustand`
- [ ] T003 [P] Configure TypeScript: set `"strict": true` and path aliases `@components`, `@pages`, `@services`, `@store`, `@database`, `@router`, `@utils` in `tsconfig.json` and `vite.config.ts` (using `vite-tsconfig-paths` or manual `resolve.alias`)
- [ ] T004 [P] Configure Jest + React Testing Library: install `jest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jest-environment-jsdom`, `ts-jest`; create `jest.config.ts` with jsdom environment and module alias resolution matching Vite aliases; add mock files in `__mocks__/` for `howler` and `music-metadata-browser`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story begins.
Includes: Dexie schema, localStorage helpers, router skeleton, and shared UI components.

**⚠️ CRITICAL**: No user story work can start until this phase is complete.

- [ ] T005 Create Dexie database schema: define `tracks`, `playlists`, and `playlist_tracks` tables with all columns and compound indexes from data-model.md; export a typed `db` singleton in `src/database/index.ts`
- [ ] T006 [P] Create `localStorage` typed helpers (`savePlaybackState`, `loadPlaybackState`) and Zustand `playbackStore` slice (currentTrackId, positionMs, volume, shuffleEnabled, repeatMode, queueTrackIds) in `src/store/playbackStore.ts`
- [ ] T007 Create React Router `<RouterProvider>` root with routes for `/library`, `/albums`, `/artists`, `/search`, `/now-playing`, `/playlists`, `/playlists/:id`, and `/queue` in `src/router/index.tsx`; wire into `src/main.tsx`
- [ ] T008 [P] Create `TrackItem` component (title, artist, album art thumbnail, duration, optional context-menu trigger) in `src/components/TrackItem/index.tsx`
- [ ] T009 [P] Create `AlbumArt` component: renders `<img>` from a `blob:` URL or `data:` URI; shows a generic placeholder SVG when `coverArtUrl` is null in `src/components/AlbumArt/index.tsx`

**Checkpoint**: Dexie schema, localStorage helpers, router shell, and shared components
are in place. User story phases can now begin (US1 and US2 can run in parallel).

---

## Phase 3: User Story 1 — Core Playback Controls (Priority: P1) 🎯 MVP

**Goal**: User selects a track and it plays with full transport controls (play/pause/seek/
skip/volume/shuffle/repeat). Audio continues when the tab is backgrounded; browser/OS
media keys work via Media Session API.

**Independent Test**: Import one audio file; click Play → audio plays; Pause → stops at
position; seek bar → jumps; Next/Previous → track changes; minimise browser → media keys
still work.

- [ ] T010 [US1] Implement `AudioPlayerService.initialize()`, `loadQueue()`, `play()`, `pause()`, `togglePlayPause()`, `seekTo()` using Howler.js following the contract in `contracts/audio-player.md` in `src/services/AudioPlayerService/index.ts`
- [ ] T011 [US1] Implement `AudioPlayerService.skipToNext()`, `skipToPrevious()` (with 3-second restart rule), `skipToIndex()`, `setVolume()` in `src/services/AudioPlayerService/index.ts`
- [ ] T012 [P] [US1] Implement `AudioPlayerService.setShuffle()`, `setRepeatMode()`, `getStatus()`, `onPlaybackStatusChange()`, `destroy()` in `src/services/AudioPlayerService/index.ts`
- [ ] T013 [P] [US1] Register Media Session API handlers (play, pause, nexttrack, previoustrack, seekto) inside `AudioPlayerService.initialize()`; update `navigator.mediaSession.metadata` on every track change; guard with `'mediaSession' in navigator` check in `src/services/AudioPlayerService/index.ts`
- [ ] T014 [P] [US1] Create `ProgressBar` component with a draggable range `<input>`, elapsed time label, and remaining time label, wired to `onChange` for seek in `src/components/ProgressBar/index.tsx`
- [ ] T015 [US1] Create `MediaControls` component with play/pause toggle, previous, next, shuffle toggle, and repeat cycle button in `src/components/MediaControls/index.tsx`
- [ ] T016 [US1] Create `NowPlayingPage` layout: large `AlbumArt`, track title + artist + album labels, `ProgressBar`, `MediaControls`, volume `<input type="range">` in `src/pages/NowPlayingPage/index.tsx`
- [ ] T017 [P] [US1] Create `QueueItem` component (track row with position number, title, artist, active-track highlight) in `src/components/QueueItem/index.tsx`
- [ ] T018 [US1] Create `QueuePage` showing the current playback queue as a virtualised list of `QueueItem` rows using `@tanstack/react-virtual`; clicking a row calls `AudioPlayerService.skipToIndex()` in `src/pages/QueuePage/index.tsx`
- [ ] T019 [US1] Wire `NowPlayingPage` to `AudioPlayerService`: play/pause, seek, skip, volume actions dispatch to the service; `onPlaybackStatusChange` updates displayed position and state in `src/pages/NowPlayingPage/index.tsx`
- [ ] T020 [P] [US1] Wire shuffle and repeat controls in `NowPlayingPage` to `AudioPlayerService.setShuffle()` and `setRepeatMode()`; reflect active state visually in `src/pages/NowPlayingPage/index.tsx`

---

## Phase 4: User Story 2 — Music Library Browse & Select (Priority: P2)

**Goal**: User imports local audio files, sees them all in the Library view, can browse by
album/artist, search by text, and click any track to play it.

**Independent Test**: Import 5+ audio files; Library page lists all tracks with metadata;
Albums/Artists tabs group correctly; search returns results < 1 second; clicking a track
loads and plays it and navigates to NowPlayingPage.

- [ ] T021 [US2] Implement `MusicLibraryService.importFiles()`: try `window.showDirectoryPicker()` (Chrome/Edge); fall back to triggering a hidden `<input type="file" multiple accept="audio/*">` for Firefox/Safari; parse each file with `music-metadata-browser`; normalise cover art `Uint8Array` to `blob:` URL; upsert track records into Dexie `tracks` table; emit `ImportProgress` callbacks in `src/services/MusicLibraryService/index.ts`
- [ ] T022 [US2] Implement `MusicLibraryService.queryTracks()`, `getTrackById()`, `getArtists()`, `getAlbums()`, `getTrackCount()` using Dexie queries (liveQuery for reactive screens) in `src/services/MusicLibraryService/index.ts`
- [ ] T023 [P] [US2] Create Zustand `libraryStore` slice: `importStatus` ('idle' | 'importing' | 'complete'), `trackCount`, `activeQuery`, `setQuery()` action in `src/store/libraryStore.ts`
- [ ] T024 [US2] Create `LibraryPage`: virtualised list of `TrackItem` rows (via `@tanstack/react-virtual`) driven by `MusicLibraryService.queryTracks()`; import-progress banner; empty-state with "Import Music" button when no tracks exist in `src/pages/LibraryPage/index.tsx`
- [ ] T025 [P] [US2] Create `AlbumsPage`: section list grouping `TrackItem` rows by album, each section header shows album name and cover art thumbnail in `src/pages/AlbumsPage/index.tsx`
- [ ] T026 [P] [US2] Create `ArtistsPage`: section list grouping `TrackItem` rows by artist in `src/pages/ArtistsPage/index.tsx`
- [ ] T027 [US2] Create `SearchPage`: `<input>` triggering `MusicLibraryService.queryTracks({ search })` on every keystroke (debounced 200 ms); results in a virtualised list of `TrackItem` rows in `src/pages/SearchPage/index.tsx`
- [ ] T028 [US2] Wire track click in `LibraryPage`, `AlbumsPage`, and `ArtistsPage`: call `AudioPlayerService.loadQueue()` with all visible tracks starting at clicked index, then navigate to `/now-playing`; touches `src/pages/LibraryPage/index.tsx`, `src/pages/AlbumsPage/index.tsx`, and `src/pages/ArtistsPage/index.tsx`
- [ ] T029 [US2] Wire `SearchPage` track click: call `AudioPlayerService.loadQueue()` with search-result tracks and navigate to `/now-playing` in `src/pages/SearchPage/index.tsx`
- [ ] T030 [P] [US2] Add a persistent "Import Music" / "Re-import" button in `LibraryPage` header that calls `MusicLibraryService.importFiles()` and resets `libraryStore.importStatus` in `src/pages/LibraryPage/index.tsx`

---

## Phase 5: User Story 3 — Playlist Management (Priority: P3)

**Goal**: User creates named playlists, adds/reorders/removes tracks, renames and deletes
playlists, and plays a playlist from any track.

**Independent Test**: Create playlist → add 3+ tracks → drag to reorder → rename → delete;
click track in playlist → playback starts from that track through end of list.

- [ ] T031 [US3] Implement `PlaylistService.createPlaylist()`, `renamePlaylist()`, `deletePlaylist()` (with cascading `playlist_tracks` deletion) following the contract in `contracts/playlist-service.md` in `src/services/PlaylistService/index.ts`
- [ ] T032 [US3] Implement `PlaylistService.getAllPlaylists()` (Dexie liveQuery) and `getPlaylistWithTracks()` (playlist + ordered tracks join) in `src/services/PlaylistService/index.ts`
- [ ] T033 [P] [US3] Implement `PlaylistService.addTrackToPlaylist()` (idempotent, appends at end), `removeTrackFromPlaylist()` (with position re-sequencing), `reorderTracks()` (full position rewrite in a Dexie transaction) in `src/services/PlaylistService/index.ts`
- [ ] T034 [P] [US3] Create Zustand `playlistStore` slice: `editingPlaylistId`, `isRenaming`, `setEditingPlaylist()`, `clearEditing()` actions in `src/store/playlistStore.ts`
- [ ] T035 [US3] Create `PlaylistsPage`: reactive list of all playlists (name, track count) with a "New Playlist" button that opens a name-input dialog in `src/pages/PlaylistsPage/index.tsx`
- [ ] T036 [US3] Create `PlaylistDetailPage`: ordered list of `TrackItem` rows with drag-to-reorder via `@dnd-kit/sortable` (`<SortableContext>` + `<DndContext>`), remove-track button per row, "Play All" and "Shuffle" buttons in `src/pages/PlaylistDetailPage/index.tsx`
- [ ] T037 [P] [US3] Add right-click / overflow context menu to `TrackItem` component: "Add to Playlist" option opens a popover listing existing playlists with a "New Playlist" option, then calls `PlaylistService.addTrackToPlaylist()` in `src/components/TrackItem/index.tsx`
- [ ] T038 [US3] Wire `PlaylistDetailPage` track click and "Play All" button: call `AudioPlayerService.loadQueue()` with playlist tracks starting at clicked index and navigate to `/now-playing` in `src/pages/PlaylistDetailPage/index.tsx`
- [ ] T039 [P] [US3] Wire `PlaylistsPage` rename (inline text input on double-click) and delete (button with confirm dialog) to `PlaylistService.renamePlaylist()` and `deletePlaylist()` in `src/pages/PlaylistsPage/index.tsx`

---

## Phase 6: User Story 4 — Persistent Playback State (Priority: P4)

**Goal**: App restores current track, seek position, volume, shuffle, and repeat mode
after page reload or browser restart.

**Independent Test**: Play track to 1:45 → reload page → same track loaded at ≈ 1:45;
shuffle and volume settings preserved.

- [ ] T040 [US4] Subscribe to `AudioPlayerService.onPlaybackStatusChange()` in `playbackStore` and persist updated `PlaybackState` to `localStorage` on every status change (position throttled to once per 5 seconds) in `src/store/playbackStore.ts`
- [ ] T041 [US4] On app load, read `PlaybackState` from `localStorage` in `playbackStore` and call `AudioPlayerService.loadQueue()` with restored `queueTrackIds`, `currentTrackId`, `positionMs`, `volume`, `shuffleEnabled`, `repeatMode` before first render in `src/store/playbackStore.ts` *(Requires T010 complete — `AudioPlayerService.initialize()` must be called first)*
- [ ] T042 [P] [US4] Validate that restored `trackId` still exists in Dexie `tracks` table before attempting to restore; if missing, clear state and start in IDLE in `src/store/playbackStore.ts`

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, browser edge cases, performance optimisations, and
production hardening across all user stories.

- [ ] T043 Add graceful unavailable-file error handling in `AudioPlayerService`: catch Howler `loaderror` / `playerror` events, log the offending file name, emit an error event via `onPlaybackStatusChange`, auto-call `skipToNext()`, and display a brief dismissible toast notification ("Skipped — file unavailable") in `src/services/AudioPlayerService/index.ts`
- [ ] T044 [P] Verify `@tanstack/react-virtual` is applied to `LibraryPage`, `AlbumsPage`, and `QueuePage` list renders; validate no visible lag with 10,000 track fixtures in tests
- [ ] T045 [P] Add Dexie compound index on `tracks` table `[artist+album]` and a prefix-search helper for `title+artist+album` to satisfy the < 1 second search requirement (SC-005) in `src/database/index.ts`
- [ ] T046 [P] Implement incremental import streaming in `MusicLibraryService.importFiles()`: push the first 50 parsed tracks to `libraryStore` immediately via an interim `onImportProgress` callback so `LibraryPage` shows tracks before the full import completes in `src/services/MusicLibraryService/index.ts`

---

## Dependencies

```
Phase 1 (Setup)
  └─► Phase 2 (Foundational)
        ├─► Phase 3 (US1 — P1 MVP) ─┬─► Phase 5 (US3 — P3)
        │                            └─► Phase 6 (US4 — P4)
        ├─► Phase 4 (US2 — P2) ──────► Phase 5 (US3 — P3) [needs library search]
        └─► Final Phase (after all user stories complete)
```

| Phase | Depends on | Can run in parallel with |
|---|---|---|
| Phase 1 (Setup) | — | — |
| Phase 2 (Foundational) | Phase 1 | — |
| Phase 3 (US1) | Phase 2 | Phase 4 (US2) |
| Phase 4 (US2) | Phase 2 | Phase 3 (US1) |
| Phase 5 (US3) | Phase 3 (US1) + Phase 2 | Phase 6 (US4) |
| Phase 6 (US4) | Phase 3 (US1) | Phase 5 (US3) |
| Final Phase | All user stories | — |

---

## Implementation Strategy

**MVP scope (deliver first)**: Phase 1 + Phase 2 + Phase 3 (US1) = T001–T020

After MVP, deliver in priority order:
1. Phase 4 (US2 — library browse) — can be developed in parallel with MVP
2. Phase 5 (US3 — playlists) — after US1 and US2
3. Phase 6 (US4 — persistence) — after US1
4. Final phase (polish) — after all stories

**Incremental validation**: Each phase ends with an independently testable checkpoint.
Use `specs/001-music-player-app/quickstart.md` validation scenarios to verify each phase
before proceeding to the next.

**Input**: Design documents from `specs/001-music-player-app/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not included (no explicit TDD request in spec). Add via `/speckit.tasks` with
`--with-tests` argument when ready.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths are included in every description

---

## Path Conventions

All source code is under the repository root.

```
src/                 → application source
tests/               → unit and integration tests
ios/                 → React Native iOS project (generated, managed by RN CLI)
android/             → React Native Android project (generated, managed by RN CLI)
specs/001-music-player-app/  → all design artifacts (do not add source code here)
```

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap the React Native project, install all dependencies, and configure
native platform settings. Nothing in this phase depends on feature logic.

- [x] T001 Initialize React Native 0.74+ project with TypeScript template: `npx react-native init MusicPlayer --template react-native-template-typescript` at repo root
- [x] T002 Install all npm dependencies: `react-native-track-player`, `react-native-get-music-files`, `@nozbe/watermelondb`, `@nozbe/with-observables`, `react-native-mmkv`, `react-native-fast-image`, `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`, `zustand`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-draggable-flatlist`
- [x] T003 [P] Configure iOS native setup: run `pod install` in `ios/`, add `audio` to `UIBackgroundModes` in `ios/MusicPlayer/Info.plist`, add `NSAppleMusicUsageDescription` and `NSMicrophoneUsageDescription` keys to `ios/MusicPlayer/Info.plist`; add `react-native-reanimated/plugin` as the **last** entry in the `plugins` array in `babel.config.js` (required by Reanimated 2 and `react-native-draggable-flatlist`)
- [x] T004 [P] Configure Android native setup: add `READ_MEDIA_AUDIO`, `READ_EXTERNAL_STORAGE`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permissions to `android/app/src/main/AndroidManifest.xml`; declare `MusicService` service entry for react-native-track-player; wrap root `App` component with `<GestureHandlerRootView style={{ flex: 1 }}>` in `App.tsx` (required by `react-native-gesture-handler` and `react-native-draggable-flatlist`)
- [x] T005 [P] Configure TypeScript: set `"strict": true` and path aliases `@components`, `@screens`, `@services`, `@store`, `@database`, `@navigation`, `@utils` in `tsconfig.json` and `babel.config.js`
- [x] T006 [P] Configure Jest: add React Native Testing Library preset, mock files for `react-native-track-player`, `react-native-mmkv`, `react-native-get-music-files` in `jest.config.js` and `__mocks__/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story begins.
Includes: WatermelonDB schema + models, MMKV setup, navigation skeleton, and shared
UI components used by all screens.

**⚠️ CRITICAL**: No user story work can start until this phase is complete.

- [x] T007 Create WatermelonDB migration 1 defining `tracks`, `playlists`, and `playlist_tracks` tables with all columns from data-model.md in `src/database/migrations/migration1.ts`
- [x] T008 Create WatermelonDB `Track` model with all fields from data-model.md and a `@writer` update method in `src/database/models/Track.ts`
- [x] T009 [P] Create WatermelonDB `Playlist` model with fields and a `@writer` rename method in `src/database/models/Playlist.ts`
- [x] T010 [P] Create WatermelonDB `PlaylistTrack` model with `playlistId`, `trackId`, `position` fields and associations to `Playlist` and `Track` in `src/database/models/PlaylistTrack.ts`
- [x] T011 Create WatermelonDB database instance with migrations and export a `DatabaseProvider` React context wrapper in `src/database/index.ts`
- [x] T012 [P] Create MMKV store instance and typed `PlaybackState` read/write helpers (`savePlaybackState`, `loadPlaybackState`) in `src/store/playbackStore.ts`
- [x] T013 Create React Navigation root: `RootNavigator` with a bottom tab bar (Library tab, Playlists tab) and a root stack for NowPlayingScreen modal push in `src/navigation/index.ts`
- [x] T014 [P] Create `TrackItem` component (title, artist, album art thumbnail, duration, optional context-menu trigger) in `src/components/TrackItem/index.tsx`
- [x] T015 [P] Create `AlbumArt` component using `react-native-fast-image` with a generic placeholder SVG when `coverArtUri` is null in `src/components/AlbumArt/index.tsx`

**Checkpoint**: All models, DB provider, MMKV helpers, navigation shell, and shared
components are in place. User story phases can now begin (US1 and US2 can run in parallel).

---

## Phase 3: User Story 1 — Core Playback Controls (Priority: P1) 🎯 MVP

**Goal**: User selects a track, it plays with full transport controls (play/pause/seek/
skip/volume/shuffle/repeat). Audio continues in background with OS lock screen controls.

**Independent Test**: Load one audio file; tap Play → audio plays; Pause → stops at
position; seek bar → jumps to position; Next/Previous → track changes; lock device →
lock screen controls appear and work. No library browsing needed.

- [x] T016 [US1] Implement `AudioPlayerService.initialize()`, `loadQueue()`, `play()`, `pause()`, `togglePlayPause()`, `seekTo()` following the contract in `contracts/audio-player.md` in `src/services/AudioPlayerService/index.ts`
- [x] T017 [US1] Implement `AudioPlayerService.skipToNext()`, `skipToPrevious()` (with 3-second restart rule), `skipToIndex()`, `setVolume()` in `src/services/AudioPlayerService/index.ts`
- [x] T018 [P] [US1] Implement `AudioPlayerService.setShuffle()`, `setRepeatMode()`, `getStatus()`, `onPlaybackStatusChange()`, `destroy()` in `src/services/AudioPlayerService/index.ts`
- [x] T019 [P] [US1] Create `PlaybackService` background task (required by react-native-track-player) and register OS remote command handlers (play, pause, next, previous, seek, headphone controls) in `src/services/AudioPlayerService/PlaybackService.ts`
- [x] T020 [P] [US1] Create `ProgressBar` component with a draggable seek thumb, elapsed time label, and remaining time label, wired to `onSlidingComplete` for seek in `src/components/ProgressBar/index.tsx`
- [x] T021 [US1] Create `MediaControls` component with play/pause toggle, previous, next, shuffle toggle, and repeat cycle button in `src/components/MediaControls/index.tsx`
- [x] T022 [US1] Create `NowPlayingScreen` layout: large `AlbumArt`, track title + artist + album labels, `ProgressBar`, `MediaControls`, volume slider in `src/screens/NowPlayingScreen/index.tsx`
- [x] T023 [P] [US1] Create `QueueItem` component (track row with position number, title, artist, active-track highlight) in `src/components/QueueItem/index.tsx`
- [x] T024 [US1] Create `QueueScreen` showing the current playback queue as a scrollable `FlatList` of `QueueItem` rows; tapping a row calls `AudioPlayerService.skipToIndex()` in `src/screens/QueueScreen/index.tsx`
- [x] T025 [US1] Wire `NowPlayingScreen` to `AudioPlayerService`: play/pause, seek, skip, volume actions dispatch to the service; `onPlaybackStatusChange` updates displayed position and state in `src/screens/NowPlayingScreen/index.tsx`
- [x] T026 [P] [US1] Wire shuffle and repeat controls in `NowPlayingScreen` to `AudioPlayerService.setShuffle()` and `setRepeatMode()`; reflect active state visually in `src/screens/NowPlayingScreen/index.tsx`

---

## Phase 4: User Story 2 — Music Library Browse & Select (Priority: P2)

**Goal**: User opens the app and sees all local audio files, can browse by album/artist,
search by text, and tap any track to play it.

**Independent Test**: 5+ audio files on device; Library screen lists all tracks with
metadata; Albums/Artists tabs group correctly; search returns results < 1 second; tapping
a track loads and plays it on NowPlayingScreen.

- [x] T027 [US2] Implement `MusicLibraryService.requestPermissions()` with iOS Music library entitlement request and Android API-version-branched permission request (API 33+: `READ_MEDIA_AUDIO`; older: `READ_EXTERNAL_STORAGE`) in `src/services/MusicLibraryService/index.ts`
- [x] T028 [US2] Implement `MusicLibraryService.scan()`: enumerate device audio files via `react-native-get-music-files`, diff against WatermelonDB `tracks` table (insert new, update changed `lastModified`, delete stale), emit `ScanProgress` callbacks in `src/services/MusicLibraryService/index.ts`
- [x] T029 [P] [US2] Implement cover art normalization inside `scan()`: convert Android base64 cover art and iOS URI cover art to a unified `file://` URI or `data:` URI stored as `coverArtUri` in `src/services/MusicLibraryService/index.ts`
- [x] T030 [P] [US2] Implement `MusicLibraryService.queryTracks()`, `getTrackById()`, `getArtists()`, `getAlbums()`, `getTrackCount()` using WatermelonDB reactive queries in `src/services/MusicLibraryService/index.ts`
- [x] T031 [P] [US2] Create Zustand `libraryStore` slice: `scanStatus` ('idle' | 'scanning' | 'complete'), `trackCount`, `activeQuery`, `setQuery()` action in `src/store/libraryStore.ts`
- [x] T032 [US2] Create `LibraryScreen`: flat `FlatList` of `TrackItem` rows driven by `MusicLibraryService.queryTracks()`, scan progress banner, empty-state message when no tracks found in `src/screens/LibraryScreen/index.tsx`
- [x] T033 [P] [US2] Create `AlbumsScreen`: section list grouping `TrackItem` rows by album, each section header shows album name and cover art thumbnail in `src/screens/AlbumsScreen/index.tsx`
- [x] T034 [P] [US2] Create `ArtistsScreen`: section list grouping `TrackItem` rows by artist in `src/screens/ArtistsScreen/index.tsx`
- [x] T035 [US2] Create `SearchScreen`: text input triggering `MusicLibraryService.queryTracks({ search })` on every keystroke (debounced 200ms); results in `FlatList` of `TrackItem` rows in `src/screens/SearchScreen/index.tsx`
- [x] T036 [US2] Wire track tap in `LibraryScreen`, `AlbumsScreen`, and `ArtistsScreen`: call `AudioPlayerService.loadQueue()` with all visible tracks starting at tapped index, then navigate to `NowPlayingScreen`; touches `src/screens/LibraryScreen/index.tsx`, `src/screens/AlbumsScreen/index.tsx`, and `src/screens/ArtistsScreen/index.tsx`
- [x] T037 [US2] Wire `SearchScreen` track tap: call `AudioPlayerService.loadQueue()` with search result tracks and navigate to `NowPlayingScreen` in `src/screens/SearchScreen/index.tsx`
- [x] T038 [P] [US2] Trigger `MusicLibraryService.requestPermissions()` then `scan()` on app cold launch in the root `App.tsx`; connect `onScanProgress` to `libraryStore` to drive the progress banner in `LibraryScreen`
- [x] T039 [US2] Add a "Refresh Library" button in `LibraryScreen` header that re-triggers `MusicLibraryService.scan()` and resets `libraryStore.scanStatus` in `src/screens/LibraryScreen/index.tsx`

---

## Phase 5: User Story 3 — Playlist Management (Priority: P3)

**Goal**: User creates named playlists, adds/reorders/removes tracks, renames and deletes
playlists, and plays a playlist from any track.

**Independent Test**: Create playlist → add 3+ tracks → reorder → rename → delete; tap
track in playlist → playback starts from that track through end of list.

- [x] T040 [US3] Implement `PlaylistService.createPlaylist()`, `renamePlaylist()`, `deletePlaylist()` (with cascading `PlaylistTrack` deletion) following the contract in `contracts/playlist-service.md` in `src/services/PlaylistService/index.ts`
- [x] T041 [US3] Implement `PlaylistService.getAllPlaylists()` (reactive WatermelonDB query) and `getPlaylistWithTracks()` (playlist + ordered tracks join) in `src/services/PlaylistService/index.ts`
- [x] T042 [P] [US3] Implement `PlaylistService.addTrackToPlaylist()` (idempotent, appends at end), `removeTrackFromPlaylist()` (with position re-sequencing), `reorderTracks()` (full position rewrite in a batch transaction) in `src/services/PlaylistService/index.ts`
- [x] T043 [P] [US3] Create Zustand `playlistStore` slice: `editingPlaylistId`, `isRenaming`, `setEditingPlaylist()`, `clearEditing()` actions in `src/store/playlistStore.ts`
- [x] T044 [US3] Create `PlaylistsScreen`: reactive list of all playlists (`PlaylistSummary` rows) with name, track count, "New Playlist" FAB that opens a name-input modal in `src/screens/PlaylistsScreen/index.tsx`
- [x] T045 [US3] Create `PlaylistDetailScreen`: ordered `FlatList` of `TrackItem` rows with drag-to-reorder using `react-native-draggable-flatlist` (`DraggableFlatList` component), remove-track swipe action, "Play All" and "Shuffle" buttons in `src/screens/PlaylistDetailScreen/index.tsx`
- [x] T046 [P] [US3] Add long-press context menu to `TrackItem` component: "Add to Playlist" option opens a bottom sheet listing existing playlists with a "New Playlist" option, then calls `PlaylistService.addTrackToPlaylist()` in `src/components/TrackItem/index.tsx`
- [x] T047 [US3] Wire `PlaylistDetailScreen` track tap and "Play All" button: call `AudioPlayerService.loadQueue()` with playlist tracks starting at tapped index and navigate to `NowPlayingScreen` in `src/screens/PlaylistDetailScreen/index.tsx`
- [x] T048 [P] [US3] Wire `PlaylistsScreen` rename (inline text field on long-press) and delete (swipe-to-delete or context menu) to `PlaylistService.renamePlaylist()` and `deletePlaylist()` in `src/screens/PlaylistsScreen/index.tsx`

---

## Phase 6: User Story 4 — Persistent Playback State (Priority: P4)

**Goal**: App restores current track, seek position, volume, shuffle, and repeat mode
after force-quit and relaunch.

**Independent Test**: Play track to 1:45 → force-quit → relaunch → same track loaded
at ≈ 1:45; shuffle and volume settings preserved.

- [x] T049 [US4] Subscribe to `AudioPlayerService.onPlaybackStatusChange()` in `playbackStore` and persist updated `PlaybackState` to MMKV on every status change (throttled to once per 5 seconds for `positionMs`) in `src/store/playbackStore.ts`
- [x] T050 [US4] On app launch, read `PlaybackState` from MMKV in `playbackStore` and call `AudioPlayerService.loadQueue()` with restored `queueTrackIds`, `currentTrackId`, `positionMs`, `volume`, `shuffleEnabled`, `repeatMode` before first render in `src/store/playbackStore.ts` *(Requires T016 complete — `AudioPlayerService.initialize()` must be called before this restore step)*
- [x] T051 [P] [US4] Validate that restored `trackId` still exists in WatermelonDB `tracks` table before attempting to restore; if missing, clear state and start in IDLE in `src/store/playbackStore.ts`

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, platform-specific edge cases, performance optimizations,
and production hardening across all user stories.

- [x] T052 Add graceful missing-file error handling in `AudioPlayerService`: catch playback error events from react-native-track-player, log the offending `filePath`, emit an error event via `onPlaybackStatusChange`, auto-call `skipToNext()`, and display a brief dismissible toast/snackbar notification to the user ("Skipped — file not found") in `src/services/AudioPlayerService/index.ts`
- [x] T053 [P] Implement incremental library streaming in `MusicLibraryService.scan()`: push the first 50 discovered tracks to `libraryStore` immediately via an interim `onScanProgress` callback so `LibraryScreen` displays tracks before the full scan completes in `src/services/MusicLibraryService/index.ts`
- [x] T054 [P] Add WatermelonDB full-text search index on the `tracks` table `title + artist + album` composite to satisfy the < 1 second search requirement (SC-002); verify query plan in `src/database/migrations/migration1.ts`
- [x] T055 [P] Verify `UIBackgroundModes` audio entry in `ios/MusicPlayer/Info.plist` and `android:foregroundServiceType="mediaPlayback"` in `android/app/src/main/AndroidManifest.xml` are present; add a startup assertion that logs a warning if either is missing in `src/services/AudioPlayerService/index.ts`

---

## Dependencies

```
Phase 1 (Setup)
  └─► Phase 2 (Foundational)
        ├─► Phase 3 (US1 — P1 MVP) ─┬─► Phase 5 (US3 — P3)
        │                            └─► Phase 6 (US4 — P4)
        ├─► Phase 4 (US2 — P2) ──────► Phase 5 (US3 — P3) [needs library search]
        └─► Final Phase (after all user stories complete)
```

| Phase | Depends on | Can run in parallel with |
|---|---|---|
| Phase 1 (Setup) | — | — |
| Phase 2 (Foundational) | Phase 1 | — |
| Phase 3 (US1) | Phase 2 | Phase 4 (US2) |
| Phase 4 (US2) | Phase 2 | Phase 3 (US1) |
| Phase 5 (US3) | Phase 3 (US1) + Phase 2 | Phase 6 (US4) |
| Phase 6 (US4) | Phase 3 (US1) | Phase 5 (US3) |
| Final Phase | All user stories | — |

---

## Parallel Execution Examples

### Two developers, starting after Phase 2

**Developer A (audio + playback)**:
T016 → T017 → T018+T019 (parallel) → T020+T021 (parallel) → T022 → T025+T026 (parallel)
→ T049 → T050+T051 (parallel)

**Developer B (library + screens)**:
T027 → T028 → T029+T030+T031 (parallel) → T032+T033+T034 (parallel) → T035
→ T036+T037 (parallel) → T038+T039 (parallel)

### After US1 + US2 complete — playlists

**Developer A or B**:
T040 → T041 → T042+T043 (parallel) → T044 → T045+T046 (parallel) → T047+T048 (parallel)

---

## Implementation Strategy

**MVP scope (deliver first)**: Phase 1 + Phase 2 + Phase 3 (US1) = T001–T026

After MVP, deliver in priority order:
1. Phase 4 (US2 — library browse) — can be developed in parallel with MVP
2. Phase 5 (US3 — playlists) — after US1 and US2
3. Phase 6 (US4 — persistence) — after US1
4. Final phase (polish) — after all stories

**Incremental validation**: Each phase ends with an independently testable checkpoint.
Use `specs/001-music-player-app/quickstart.md` validation scenarios to verify each phase
before proceeding to the next.

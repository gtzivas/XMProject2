# Research: Music Player App

**Phase**: 0 — Unknowns Resolution
**Date**: 2026-07-02
**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Unknowns Resolved

The following unknowns were identified in the Technical Context as NEEDS CLARIFICATION
and are resolved here before Phase 1 design proceeds.

---

## Decision 1: Platform Strategy

**Unknown**: What platform should this music player target?

**Decision**: React + TypeScript web app (targets modern desktop browsers; built with Vite)

**Rationale**:
- User explicitly specified a web app running in the browser.
- React 18 shares the same component model as the original React Native design, meaning
  the service contracts, data model, and state management (Zustand) carry over unchanged.
- Vite provides fast HMR and an optimised production build; no native toolchain required.
- TypeScript provides compile-time safety for the service contracts defined in Phase 1.

**Alternatives considered**:
- *React Native (mobile)*: Originally specified but rejected per user requirement change.
- *Vue / Svelte*: Capable. React chosen to align with the team's existing React knowledge
  and to maximise reuse of the component and service architecture already designed.
- *Next.js (SSR)*: Overkill — this app is fully offline with no server-rendered pages.
  A plain Vite SPA is simpler and sufficient.

---

## Decision 2: Audio Playback Engine

**Unknown**: Which audio library to use for playback, background audio, and browser media
controls?

**Decision**: `howler` 2.x

**Rationale**:
- Howler.js wraps the Web Audio API with an HTML5 Audio fallback, providing a single
  consistent API across all modern browsers (Chrome, Edge, Firefox, Safari).
- Exposes play, pause, seek, volume, and event callbacks that map directly onto the
  spec's playback requirements (FR-001 – FR-006).
- Handles audio context unlock (required by browser autoplay policies) automatically.
- Actively maintained, TypeScript types available via `@types/howler`.
- Queue management (FR-002 skip next/previous) is implemented in `AudioPlayerService`
  on top of Howler rather than delegated to the library — keeping the design simple.

**Alternatives considered**:
- *Web Audio API (bare)*: Full control but requires significant boilerplate for seek,
  volume, and event management. Howler provides that abstraction without lock-in.
- *`Tone.js`*: Built for synthesis and effects (Equalizer, DSP). Overkill for a music
  player; spec explicitly excludes equalizer/DSP effects.
- *HTML5 `<audio>` element directly*: Viable for basic playback but lacks a clean
  programmatic API for queue management and cross-browser event normalisation.

---

## Decision 3: Local File Access + Metadata Parsing

**Unknown**: How to let the user import local audio files and read their metadata
(title, artist, album, embedded cover art) in a browser context?

**Decision**: File System Access API (Chrome/Edge) + `<input type="file">` fallback; `music-metadata-browser` for tag parsing

**Rationale**:
- The File System Access API (`window.showDirectoryPicker`) lets the user select a folder
  on Chrome and Edge; the browser retains a handle for re-reading on the next session
  (with re-grant prompt), enabling the "persistent library" requirement.
- `<input type="file" multiple accept="audio/*">` is the universal fallback for Firefox
  and Safari, which do not support `showDirectoryPicker`. Users select files individually
  or as a folder (Chrome/Edge also support `webkitdirectory`).
- `music-metadata-browser` parses ID3v2/ID3v1 (MP3), Vorbis comments (FLAC/OGG), and
  MP4/M4A tags directly from a `File` object in the browser, returning title, artist,
  album, duration, and embedded cover art as a `Uint8Array`. No server required.
- Incremental processing: files are parsed one by one and pushed to `libraryStore`
  so that the first 50 tracks appear before the full import completes (SC-001 style).

**Alternatives considered**:
- *`jsmediatags`*: Older, less maintained. Does not support FLAC or Vorbis. Rejected.
- *`id3js`*: MP3-only. Rejected for incomplete format coverage.
- *`expo-media-library` / `react-native-get-music-files`*: React Native only. Not
  applicable in a browser context.

---

## Decision 4: Local Database (Library Index + Playlists)

**Unknown**: How to persist the music library index and playlist data efficiently in a
browser environment?

**Decision**: `dexie` 3.x (IndexedDB wrapper)

**Rationale**:
- Dexie wraps the browser's native IndexedDB API with a clean, promise-based query
  interface including compound indexes — required for filtering tracks by artist/album
  and for full-text-style prefix searches (FR-008).
- IndexedDB can comfortably hold 10,000+ track records with sub-second query times,
  satisfying SC-005.
- Dexie's `liveQuery` hook integrates with React state, so library and playlist views
  re-render automatically when data changes after an import or rescan.
- Fully offline — no network dependency; data persists across browser sessions.

**Alternatives considered**:
- *`localStorage`*: Key-value only; not suitable for querying relational data
  (tracks ↔ playlists). Limited to ~5 MB. Rejected for library storage.
- *`sql.js` (SQLite in WASM)*: Full SQL but no reactivity and a large (~1 MB) WASM
  bundle. Dexie achieves the same query capability with better DX and smaller footprint.
- *`WatermelonDB`*: React Native / React Native Web only; not designed for vanilla
  browser environments. Rejected.
- *In-memory + localStorage*: Not viable for 10,000 tracks (memory pressure +
  serialisation cost on every write).

---

## Decision 5: Playback State Persistence

**Unknown**: How to persist transient playback state (current track, seek position,
volume, shuffle/repeat) across browser session refreshes?

**Decision**: `localStorage` (synchronous, string key-value)

**Rationale**:
- Playback state is a single flat record — a perfect fit for `localStorage`'s key-value
  model.
- Synchronous reads (`localStorage.getItem`) mean state is available before the first
  render frame, enabling immediate playback resume on page reload.
- Throttling position writes to once per 5 seconds avoids excessive `localStorage`
  write pressure.
- No extra dependency required; universally supported in all browsers.

**Alternatives considered**:
- *Dexie (IndexedDB)*: Overkill for a single flat record; async reads would require a
  loading state before playback can resume. Rejected.
- *`react-native-mmkv`*: React Native JSI library; not applicable in a browser. Rejected.
- *`sessionStorage`*: Cleared when the tab is closed. Does not satisfy SC-003 (restore
  across app restarts). Rejected.

---

## Gaps & Known Limitations

| Gap | Impact | Resolution |
|-----|--------|------------|
| File System Access API (`showDirectoryPicker`) is not supported in Firefox or Safari. | Users on those browsers cannot select a whole folder; must select files individually. | Fall back to `<input type="file" webkitdirectory>` (Chrome/Edge) and `<input type="file" multiple>` (Firefox/Safari). Document in quickstart. |
| Browser autoplay policy blocks audio context until a user gesture. | First playback attempt may be silently blocked if triggered programmatically before any click. | Howler handles `AudioContext.resume()` on first user interaction automatically; `AudioPlayerService` additionally gates `play()` behind an interaction check. |
| File System Access handles are not serialisable to IndexedDB in all browsers yet. | Library re-import may be required on next session in some browsers. | Store file handles in IndexedDB where supported (Chrome 86+); fall back to re-prompting the user to re-select the folder. Document in quickstart. |
| Media Session API for OS media controls is not supported in Firefox. | Browser/OS media key controls unavailable on Firefox. | Implement where `'mediaSession' in navigator` is true; degrade gracefully otherwise. Spec uses SHOULD not MUST for FR-014. |
| Cover art from `music-metadata-browser` is returned as a raw `Uint8Array`. | `AlbumArt` component must convert to a `blob:` URL before rendering as `<img src>`. | Normalise in `MusicLibraryService` import step using `URL.createObjectURL`. |

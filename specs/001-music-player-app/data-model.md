# Data Model: Music Player App

**Phase**: 1 — Design
**Date**: 2026-07-02
**Feature**: [spec.md](spec.md) | **Research**: [research.md](research.md)

## Overview

The music player app has four primary domain entities. `Track` and `Playlist` are
persisted in WatermelonDB (SQLite). `PlaybackState` is persisted in MMKV. `Library` is
a runtime view computed from the WatermelonDB Track table and is not stored separately.

```
┌────────────────────┐         ┌─────────────────────┐
│       Track        │◄────────│   PlaylistTrack      │
│ ─────────────────  │  M    M │ ─────────────────    │
│ id (uuid)          │         │ id (uuid)            │
│ title              │         │ playlistId (FK)      │
│ artist             │         │ trackId (FK)         │
│ album              │         │ position (int)       │
│ duration (ms)      │         └──────────┬──────────┘
│ filePath           │                    │ belongs to
│ coverArtUri?       │         ┌──────────▼──────────┐
│ fileSize (bytes)   │         │       Playlist       │
│ mimeType           │         │ ─────────────────    │
│ lastModified       │         │ id (uuid)            │
└────────────────────┘         │ name                 │
                               │ createdAt            │
                               │ updatedAt            │
                               └─────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    PlaybackState                    │
│ (persisted in MMKV — not a database table)          │
│ ─────────────────────────────────────────────────── │
│ currentTrackId: string | null                       │
│ queueTrackIds: string[]                             │
│ positionMs: number                                  │
│ volume: number (0.0–1.0)                            │
│ shuffleEnabled: boolean                             │
│ repeatMode: 'off' | 'track' | 'queue'               │
└─────────────────────────────────────────────────────┘
```

---

## Entity: Track

**Description**: Represents a single discoverable audio file on the device. The Track
table is the authoritative music library index; it is populated (and refreshed) by
`MusicLibraryService` on each cold app launch.

**Storage**: WatermelonDB `tracks` table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | WatermelonDB primary key |
| `title` | `string` | ✅ | Track title from ID3/Vorbis tag; filename stem if absent |
| `artist` | `string` | ✅ | Artist name; `"Unknown Artist"` if tag absent |
| `album` | `string` | ✅ | Album name; `"Unknown Album"` if tag absent |
| `durationMs` | `number` | ✅ | Duration in milliseconds |
| `filePath` | `string` | ✅ | Absolute path to audio file on device storage |
| `coverArtUri` | `string \| null` | ❌ | URI or base64 data URI of embedded cover art; `null` if absent |
| `fileSize` | `number` | ✅ | File size in bytes |
| `mimeType` | `string` | ✅ | MIME type (e.g., `audio/mpeg`, `audio/flac`) |
| `lastModified` | `number` | ✅ | File last-modified epoch (ms); used to detect stale library entries |

**Validation rules**:
- `filePath` MUST be unique within the `tracks` table.
- `durationMs` MUST be > 0.
- `title`, `artist`, `album` MUST NOT be empty (use fallback strings, never empty).

**Indexes**:
- `filePath` (unique) — fast lookup during library diff/rescan
- `artist`, `album` — used by group-by queries in Albums and Artists screens
- Full-text search index on `title + artist + album` — used by SearchScreen

---

## Entity: Playlist

**Description**: A user-named, ordered collection of tracks. Playlists are created,
renamed, and deleted by the user via `PlaylistService`.

**Storage**: WatermelonDB `playlists` table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | WatermelonDB primary key |
| `name` | `string` | ✅ | User-provided playlist name |
| `createdAt` | `Date` | ✅ | Creation timestamp (managed by WatermelonDB) |
| `updatedAt` | `Date` | ✅ | Last-modified timestamp (managed by WatermelonDB) |

**Validation rules**:
- `name` MUST NOT be empty.
- `name` MUST NOT exceed 100 characters.

---

## Entity: PlaylistTrack (join table)

**Description**: Ordered association between a `Playlist` and a `Track`. The `position`
field controls track order within the playlist.

**Storage**: WatermelonDB `playlist_tracks` table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | WatermelonDB primary key |
| `playlistId` | `string` | ✅ | FK → `playlists.id` |
| `trackId` | `string` | ✅ | FK → `tracks.id` |
| `position` | `number` | ✅ | Integer sort order (0-based, contiguous) |

**Validation rules**:
- `(playlistId, trackId)` combination MUST be unique — a track cannot appear twice in the
  same playlist.
- `position` MUST be unique within a given `playlistId`.
- On playlist track deletion, remaining `position` values MUST be re-sequenced (no gaps).

---

## Entity: PlaybackState

**Description**: Transient but persisted record of the current playback session. Stored
in MMKV as a flat JSON blob; not a database table. Restored on app relaunch to resume
playback.

**Storage**: MMKV key `playback_state`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `currentTrackId` | `string \| null` | `null` | ID of the currently loaded track |
| `queueTrackIds` | `string[]` | `[]` | Ordered list of track IDs in the current queue |
| `positionMs` | `number` | `0` | Last known seek position in milliseconds |
| `volume` | `number` | `1.0` | Playback volume (0.0 = muted, 1.0 = max) |
| `shuffleEnabled` | `boolean` | `false` | Whether shuffle mode is active |
| `repeatMode` | `'off' \| 'track' \| 'queue'` | `'off'` | Repeat behaviour |

**State transitions**:

```
                   ┌──────────────────────┐
                   │  IDLE (no track)      │
                   └──────────┬───────────┘
                              │ loadTrack()
                   ┌──────────▼───────────┐
              ┌───►│  READY (loaded)       │◄──┐
              │    └──────────┬───────────┘   │
              │               │ play()        │
              │    ┌──────────▼───────────┐   │
    pause()   │    │     PLAYING           │   │ trackEnded / skipNext
              │    └──────────┬───────────┘   │
              │               │ pause()       │
              │    ┌──────────▼───────────┐   │
              └────│     PAUSED            │   │
                   └──────────┬───────────┘   │
                              │ skipNext/Prev  │
                              └───────────────┘
```

---

## Relationships Summary

| Relationship | Cardinality | Join |
|---|---|---|
| Track ↔ Playlist | Many-to-many | via `PlaylistTrack` |
| PlaylistTrack → Track | Many-to-one | `trackId` |
| PlaylistTrack → Playlist | Many-to-one | `playlistId` |
| PlaybackState → Track | Zero-or-one | `currentTrackId` (soft reference, not FK) |
| PlaybackState → Queue | One-to-many | `queueTrackIds[]` (ordered list of track IDs) |

---

## Migration Strategy

WatermelonDB migrations are append-only schema files under `src/database/migrations/`.

- **Migration 1** (initial schema): Create `tracks`, `playlists`, `playlist_tracks` tables
  with all fields listed above.
- Future migrations MUST only add columns or tables; existing columns MUST NOT be removed
  or renamed without a bridge migration.

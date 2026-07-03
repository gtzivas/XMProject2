# Contract: MusicLibraryService

**Phase**: 1 — Design
**Date**: 2026-07-02
**Type**: TypeScript service interface (internal module contract)

## Purpose

`MusicLibraryService` is responsible for scanning device storage, reading audio file
metadata, and maintaining a synchronized index of all local tracks in the WatermelonDB
`tracks` table. It is the exclusive owner of `Track` creation and deletion in the
database.

---

## Interface

```typescript
interface ScanProgress {
  scannedCount: number;   // Tracks processed so far
  totalCount: number | null; // Total known files (null if still enumerating)
  isComplete: boolean;
}

interface ScanResult {
  added: number;    // New tracks inserted into DB
  updated: number;  // Existing tracks whose metadata changed
  removed: number;  // Tracks removed because their file no longer exists
  errors: number;   // Files skipped due to read errors
}

interface TrackQuery {
  search?: string;              // Full-text search across title + artist + album
  artist?: string;              // Filter by exact artist name
  album?: string;               // Filter by exact album name
  sortBy?: 'title' | 'artist' | 'album' | 'duration' | 'lastModified';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface MusicLibraryService {
  /**
   * Request required device permissions (READ_MEDIA_AUDIO on Android 13+,
   * NSAppleMusicUsageDescription on iOS). Returns whether permission was granted.
   * MUST be called before scan().
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Scan device storage for audio files and synchronize the WatermelonDB
   * tracks table. Emits progress via onScanProgress as files are found.
   *
   * The scan is additive-first: new files are inserted immediately so
   * the UI can show tracks before the full scan completes.
   *
   * @returns A ScanResult summary when the scan is complete.
   */
  scan(): Promise<ScanResult>;

  /**
   * Subscribe to scan progress events.
   * Returns an unsubscribe function.
   */
  onScanProgress(listener: (progress: ScanProgress) => void): () => void;

  /**
   * Query the local track index.
   * Results come from WatermelonDB (no file system access at query time).
   *
   * @returns Array of Track entities matching the query.
   */
  queryTracks(query?: TrackQuery): Promise<Track[]>;

  /**
   * Return a single Track by its ID.
   * Returns null if the track does not exist in the index.
   */
  getTrackById(id: string): Promise<Track | null>;

  /**
   * Return all distinct artist names in the library, sorted alphabetically.
   */
  getArtists(): Promise<string[]>;

  /**
   * Return all distinct album names in the library, optionally filtered by artist.
   * Sorted alphabetically.
   */
  getAlbums(artist?: string): Promise<string[]>;

  /**
   * Return the total number of tracks in the library index.
   */
  getTrackCount(): Promise<number>;
}
```

---

## Track type (WatermelonDB model interface)

```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  filePath: string;
  coverArtUri: string | null;
  fileSize: number;
  mimeType: string;
  lastModified: number;
}
```

*(Defined here for reference; canonical definition is in `src/database/models/Track.ts`)*

---

## Scan Behaviour

1. Request permissions. Abort scan and return `{ added:0, updated:0, removed:0, errors:0 }` if denied.
2. Enumerate audio files from device storage (platform-specific API).
3. For each file:
   - Read metadata (title, artist, album, duration, cover art, MIME type).
   - Look up existing DB record by `filePath`.
   - **If not found**: insert new `Track` record; increment `added`.
   - **If found and `lastModified` changed**: update record; increment `updated`.
   - **If found and unchanged**: skip (no DB write).
4. After enumeration: find `Track` records whose `filePath` no longer exists on disk;
   delete them; increment `removed`.
5. Emit final `ScanProgress { isComplete: true }`.

## Error Handling

| Error condition | Behaviour |
|---|---|
| Permission denied | Return `ScanResult` with all zeros; emit `onScanProgress` with `isComplete: true` |
| File metadata unreadable | Skip file; increment `errors`; continue scan |
| WatermelonDB write failure | Log error; continue scan; include failed track in `errors` count |
| File exists but is not a supported audio format | Skip silently; not counted in `errors` |

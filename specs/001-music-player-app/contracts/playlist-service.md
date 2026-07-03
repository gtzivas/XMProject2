# Contract: PlaylistService

**Phase**: 1 — Design
**Date**: 2026-07-02
**Type**: TypeScript service interface (internal module contract)

## Purpose

`PlaylistService` manages all CRUD operations on playlists and their track associations
via WatermelonDB. It is the exclusive owner of `Playlist` and `PlaylistTrack` records in
the database.

---

## Interface

```typescript
interface PlaylistWithTracks {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  tracks: Track[];      // Ordered by PlaylistTrack.position ascending
  trackCount: number;
}

interface PlaylistSummary {
  id: string;
  name: string;
  trackCount: number;
  updatedAt: Date;
}

interface PlaylistService {
  /**
   * Create a new empty playlist.
   * @param name  User-provided playlist name (must be non-empty, max 100 chars).
   * @returns The created Playlist entity.
   * @throws  ValidationError if name is empty or exceeds 100 characters.
   */
  createPlaylist(name: string): Promise<Playlist>;

  /**
   * Rename an existing playlist.
   * @throws  NotFoundError if playlist with the given ID does not exist.
   * @throws  ValidationError if new name is empty or exceeds 100 characters.
   */
  renamePlaylist(playlistId: string, newName: string): Promise<void>;

  /**
   * Delete a playlist and all its PlaylistTrack associations.
   * The underlying Track records are NOT deleted.
   * @throws  NotFoundError if playlist does not exist.
   */
  deletePlaylist(playlistId: string): Promise<void>;

  /**
   * Return all playlists as summaries (no track data), sorted by name ascending.
   */
  getAllPlaylists(): Promise<PlaylistSummary[]>;

  /**
   * Return a single playlist with its full, ordered list of tracks.
   * Returns null if the playlist does not exist.
   */
  getPlaylistWithTracks(playlistId: string): Promise<PlaylistWithTracks | null>;

  /**
   * Add a track to the end of a playlist.
   * If the track is already in the playlist, this is a no-op (no duplicate added).
   *
   * @throws  NotFoundError if playlist or track does not exist.
   */
  addTrackToPlaylist(playlistId: string, trackId: string): Promise<void>;

  /**
   * Remove a track from a playlist.
   * Remaining tracks are re-sequenced to close the position gap.
   *
   * @throws  NotFoundError if playlist does not exist or track is not in the playlist.
   */
  removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void>;

  /**
   * Reorder tracks within a playlist by providing the new desired order.
   *
   * @param playlistId   Target playlist ID.
   * @param orderedTrackIds  Complete ordered list of all track IDs in the playlist.
   *                         MUST contain the same set of IDs already in the playlist.
   * @throws  ValidationError if orderedTrackIds does not match existing playlist tracks.
   * @throws  NotFoundError   if playlist does not exist.
   */
  reorderTracks(playlistId: string, orderedTrackIds: string[]): Promise<void>;
}
```

---

## Playlist type (WatermelonDB model interface)

```typescript
interface Playlist {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

*(Canonical definition in `src/database/models/Playlist.ts`)*

---

## Error Types

```typescript
class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`);
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}
```

---

## Behaviour Notes

- All write operations MUST be wrapped in a WatermelonDB `batch()` transaction to ensure
  atomicity (no partial writes).
- `reorderTracks` MUST rewrite all `PlaylistTrack.position` values for the playlist in a
  single batch transaction.
- `deletePlaylist` MUST delete all associated `PlaylistTrack` records before or within
  the same transaction as deleting the `Playlist` record.
- `getAllPlaylists` MUST be reactive: callers subscribing to the WatermelonDB query will
  receive automatic updates when any playlist is created, renamed, or deleted.

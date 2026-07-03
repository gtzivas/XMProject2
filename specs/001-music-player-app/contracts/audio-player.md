# Contract: AudioPlayerService

**Phase**: 1 — Design
**Date**: 2026-07-02
**Type**: TypeScript service interface (internal module contract)

## Purpose

`AudioPlayerService` is the single point of control for all audio playback operations.
It wraps `react-native-track-player` and exposes a domain-oriented interface to screens
and stores. No screen or component MUST call `react-native-track-player` directly.

---

## Interface

```typescript
/**
 * Represents a track as required by the audio engine.
 * Derived from the database Track entity but includes only
 * fields needed for playback and OS media display.
 */
interface AudioTrack {
  id: string;          // WatermelonDB track ID
  url: string;         // file:// URI to local audio file
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  artwork?: string;    // URI or base64 data URI for cover art
}

type RepeatMode = 'off' | 'track' | 'queue';

interface PlaybackStatus {
  trackId: string | null;
  positionMs: number;
  durationMs: number;
  isPlaying: boolean;
  isBuffering: boolean;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  volume: number;       // 0.0–1.0
}

interface AudioPlayerService {
  /**
   * Initialize the audio engine. MUST be called once at app startup before
   * any other method. Idempotent — safe to call multiple times.
   */
  initialize(): Promise<void>;

  /**
   * Load a queue of tracks and optionally start from a specific index.
   * Replaces the current queue entirely.
   *
   * @param tracks   Ordered array of tracks to queue.
   * @param startIndex  Index of the track to load first (default: 0).
   * @param autoPlay    Whether to begin playback immediately (default: true).
   */
  loadQueue(tracks: AudioTrack[], startIndex?: number, autoPlay?: boolean): Promise<void>;

  /** Resume or begin playback of the currently loaded track. */
  play(): Promise<void>;

  /** Pause playback, preserving the current position. */
  pause(): Promise<void>;

  /** Toggle between play and pause. */
  togglePlayPause(): Promise<void>;

  /**
   * Seek to an absolute position within the current track.
   * @param positionMs  Target position in milliseconds.
   */
  seekTo(positionMs: number): Promise<void>;

  /**
   * Skip to the next track in the queue.
   * If repeat mode is 'queue' and the current track is last, wraps to the start.
   */
  skipToNext(): Promise<void>;

  /**
   * Skip to the previous track in the queue, or restart the current track
   * if the current position is more than 3 seconds in.
   */
  skipToPrevious(): Promise<void>;

  /**
   * Skip directly to a track at a given queue index.
   * @param index  Zero-based index into the current queue.
   */
  skipToIndex(index: number): Promise<void>;

  /**
   * Set the playback volume.
   * @param volume  Value between 0.0 (muted) and 1.0 (full).
   */
  setVolume(volume: number): Promise<void>;

  /**
   * Enable or disable shuffle mode. When enabled, the queue order is randomised
   * in memory; the original order is restored when shuffle is disabled.
   */
  setShuffle(enabled: boolean): Promise<void>;

  /**
   * Set the repeat mode.
   * 'off' — no repeat; stop after last track.
   * 'track' — repeat the current track indefinitely.
   * 'queue' — repeat the queue from the beginning after the last track.
   */
  setRepeatMode(mode: RepeatMode): Promise<void>;

  /**
   * Returns a snapshot of the current playback status.
   * For reactive updates, subscribe via onPlaybackStatusChange.
   */
  getStatus(): Promise<PlaybackStatus>;

  /**
   * Subscribe to playback status changes.
   * Fires whenever play/pause state, position, or track changes.
   * Returns an unsubscribe function.
   */
  onPlaybackStatusChange(listener: (status: PlaybackStatus) => void): () => void;

  /**
   * Stop playback and release audio engine resources.
   * Called on app background transition if required by OS.
   */
  destroy(): Promise<void>;
}
```

---

## Error Handling

| Error condition | Behaviour |
|---|---|
| File at `url` is missing or unreadable | Skip to next track; emit `onPlaybackStatusChange` with `isPlaying: false`; log error with file path |
| `seekTo` position > `durationMs` | Clamp to `durationMs - 100ms`; no throw |
| `loadQueue` with empty array | Transition to IDLE state; no playback; no throw |
| `skipToNext` at end of queue with `repeatMode: 'off'` | Transition to IDLE; do not throw |
| `initialize` called before audio session is available | Retry up to 3 times with 500ms backoff; throw `AudioInitError` on third failure |

---

## OS Media Control Integration

`AudioPlayerService.initialize()` MUST register handlers for all OS media remote
commands:

- Lock screen / notification: play, pause, next, previous, seek
- Headphone controls: single tap (play/pause), double tap (next), triple tap (previous)
- CarPlay / Android Auto: play, pause, next, previous

These are handled internally by `react-native-track-player`'s capability registration
and require no additional contract surface.

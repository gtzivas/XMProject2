import { create } from 'zustand';

export type RepeatMode = 'off' | 'track' | 'queue';

export interface PlaybackState {
  currentTrackId: string | null;
  queueTrackIds: string[];
  positionMs: number;
  durationMs: number;
  isPlaying: boolean;
  volume: number;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
}

const STORAGE_KEY = 'playback_state';

function loadFromStorage(): Partial<PlaybackState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveToStorage(state: Partial<PlaybackState>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

interface PlaybackStore extends PlaybackState {
  setCurrentTrackId: (id: string | null) => void;
  setQueueTrackIds: (ids: string[]) => void;
  setPositionMs: (pos: number) => void;
  setDurationMs: (dur: number) => void;
  setIsPlaying: (p: boolean) => void;
  setVolume: (v: number) => void;
  setShuffleEnabled: (e: boolean) => void;
  setRepeatMode: (m: RepeatMode) => void;
  persist: () => void;
}

const saved = loadFromStorage();

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  currentTrackId: saved.currentTrackId ?? null,
  queueTrackIds: saved.queueTrackIds ?? [],
  positionMs: saved.positionMs ?? 0,
  durationMs: 0,
  isPlaying: false,
  volume: saved.volume ?? 1,
  shuffleEnabled: saved.shuffleEnabled ?? false,
  repeatMode: (saved.repeatMode as RepeatMode) ?? 'off',
  setCurrentTrackId: (id) => set({ currentTrackId: id }),
  setQueueTrackIds: (ids) => set({ queueTrackIds: ids }),
  setPositionMs: (pos) => set({ positionMs: pos }),
  setDurationMs: (dur) => set({ durationMs: dur }),
  setIsPlaying: (p) => set({ isPlaying: p }),
  setVolume: (v) => set({ volume: v }),
  setShuffleEnabled: (e) => set({ shuffleEnabled: e }),
  setRepeatMode: (m) => set({ repeatMode: m }),
  persist: () => {
    const s = get();
    saveToStorage({ currentTrackId: s.currentTrackId, queueTrackIds: s.queueTrackIds, positionMs: s.positionMs, volume: s.volume, shuffleEnabled: s.shuffleEnabled, repeatMode: s.repeatMode });
  },
}));

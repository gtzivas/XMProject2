import { Howl } from 'howler';
import type { RepeatMode } from '@store/playbackStore';

export interface AudioTrack {
  id: string; url: string; title: string; artist: string;
  album: string; durationMs: number; artwork?: string;
}

export interface PlaybackStatus {
  trackId: string | null; positionMs: number; durationMs: number;
  isPlaying: boolean; isBuffering: boolean;
  shuffleEnabled: boolean; repeatMode: RepeatMode; volume: number;
}

type Listener = (s: PlaybackStatus) => void;

let queue: AudioTrack[] = [];
let shuffledOrder: number[] = [];
let currentIndex = 0;
let howl: Howl | null = null;
let shuffleOn = false;
let repeatMode: RepeatMode = 'off';
let vol = 1;
let ticker: ReturnType<typeof setInterval> | null = null;
let initialized = false;
const listeners = new Set<Listener>();

function actualIndex(i: number) { return shuffleOn && shuffledOrder.length ? shuffledOrder[i] as number : i; }

function currentTrack() { return queue[actualIndex(currentIndex)] ?? null; }

function emit(extra?: Partial<PlaybackStatus>) {
  const pos = howl ? (howl.seek() as number) * 1000 : 0;
  const dur = howl ? howl.duration() * 1000 : (currentTrack()?.durationMs ?? 0);
  const s: PlaybackStatus = {
    trackId: currentTrack()?.id ?? null, positionMs: pos, durationMs: dur,
    isPlaying: howl?.playing() ?? false, isBuffering: false,
    shuffleEnabled: shuffleOn, repeatMode, volume: vol, ...extra,
  };
  listeners.forEach(l => l(s));
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = s.isPlaying ? 'playing' : 'paused';
    if (typeof navigator.mediaSession.setPositionState === 'function' && dur > 0) {
      try { navigator.mediaSession.setPositionState({ duration: dur / 1000, position: pos / 1000, playbackRate: 1 }); } catch {}
    }
  }
}

function startTicker() { if (!ticker) ticker = setInterval(() => emit(), 500); }
function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }

function buildShuffle() {
  const idx = Array.from({ length: queue.length }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i]!, idx[j]!] = [idx[j]!, idx[i]!];
  }
  const cur = idx.indexOf(currentIndex < queue.length ? currentIndex : 0);
  if (cur > 0) { [idx[0]!, idx[cur]!] = [idx[cur]!, idx[0]!]; }
  shuffledOrder = idx;
  currentIndex = 0;
}

function updateMediaMeta() {
  if (!('mediaSession' in navigator)) return;
  const t = currentTrack();
  if (!t) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: t.title, artist: t.artist, album: t.album,
    artwork: t.artwork ? [{ src: t.artwork }] : [],
  });
}

function loadAt(i: number, autoPlay = true) {
  if (howl) { howl.unload(); howl = null; }
  stopTicker();
  if (i < 0 || i >= queue.length) return;
  currentIndex = i;
  const t = currentTrack()!;
  if (!t.url) { skipNextInternal(); return; }
  howl = new Howl({
    src: [t.url], html5: true, volume: vol,
    onplay: () => { startTicker(); updateMediaMeta(); emit({ isPlaying: true }); },
    onpause: () => { stopTicker(); emit({ isPlaying: false }); },
    onstop: () => { stopTicker(); emit({ isPlaying: false }); },
    onend: () => { stopTicker(); onEnd(); },
    onloaderror: (_id: number, err: unknown) => { console.error('load err', t.url, err); skipNextInternal(); },
    onplayerror: (_id: number, _err: unknown) => { howl?.once('unlock', () => howl?.play()); },
  });
  if (autoPlay) howl.play(); else emit({ isPlaying: false });
}

function onEnd() {
  if (repeatMode === 'track') { howl?.seek(0); howl?.play(); return; }
  skipNextInternal();
}

function skipNextInternal() {
  const next = currentIndex + 1;
  if (next >= queue.length) {
    if (repeatMode === 'queue') { loadAt(0); }
    else { stopTicker(); howl?.stop(); emit({ isPlaying: false, positionMs: 0 }); }
  } else { loadAt(next); }
}

function registerMediaHandlers() {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.setActionHandler('play', () => AudioPlayerService.play());
  navigator.mediaSession.setActionHandler('pause', () => AudioPlayerService.pause());
  navigator.mediaSession.setActionHandler('nexttrack', () => AudioPlayerService.skipToNext());
  navigator.mediaSession.setActionHandler('previoustrack', () => AudioPlayerService.skipToPrevious());
  navigator.mediaSession.setActionHandler('seekto', (d) => { if (d.seekTime != null) AudioPlayerService.seekTo(d.seekTime * 1000); });
}

export const AudioPlayerService = {
  async initialize() { if (initialized) return; initialized = true; registerMediaHandlers(); },

  async loadQueue(tracks: AudioTrack[], startIndex = 0, autoPlay = true) {
    queue = [...tracks]; currentIndex = startIndex;
    if (shuffleOn) buildShuffle();
    loadAt(startIndex, autoPlay);
  },

  async play() { howl?.play(); },
  async pause() { howl?.pause(); },
  async togglePlayPause() { howl?.playing() ? howl.pause() : howl?.play(); },

  async seekTo(ms: number) {
    const dur = howl ? howl.duration() * 1000 : 0;
    howl?.seek(Math.min(ms, Math.max(0, dur - 100)) / 1000);
    emit();
  },

  async skipToNext() { skipNextInternal(); },

  async skipToPrevious() {
    const pos = howl ? (howl.seek() as number) : 0;
    if (pos > 3) { howl?.seek(0); emit(); }
    else if (currentIndex > 0) { loadAt(currentIndex - 1); }
    else if (repeatMode === 'queue') { loadAt(queue.length - 1); }
    else { howl?.seek(0); emit(); }
  },

  async skipToIndex(i: number) { if (i >= 0 && i < queue.length) loadAt(i); },

  async setVolume(v: number) { vol = Math.max(0, Math.min(1, v)); howl?.volume(vol); emit(); },

  async setShuffle(on: boolean) {
    shuffleOn = on;
    if (on) buildShuffle();
    else { currentIndex = actualIndex(currentIndex); shuffledOrder = []; }
    emit();
  },

  async setRepeatMode(m: RepeatMode) { repeatMode = m; emit(); },

  async getStatus(): Promise<PlaybackStatus> {
    const pos = howl ? (howl.seek() as number) * 1000 : 0;
    const dur = howl ? howl.duration() * 1000 : (currentTrack()?.durationMs ?? 0);
    return { trackId: currentTrack()?.id ?? null, positionMs: pos, durationMs: dur, isPlaying: howl?.playing() ?? false, isBuffering: false, shuffleEnabled: shuffleOn, repeatMode, volume: vol };
  },

  onPlaybackStatusChange(l: Listener): () => void { listeners.add(l); return () => listeners.delete(l); },
  async destroy() { stopTicker(); howl?.unload(); howl = null; listeners.clear(); },
  getCurrentQueue() { return queue; },
  getCurrentIndex() { return currentIndex; },
  getActualIndex() { return actualIndex(currentIndex); },
};

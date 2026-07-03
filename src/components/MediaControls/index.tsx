import React from 'react';
import type { RepeatMode } from '@store/playbackStore';

const btn = (active = false): React.CSSProperties => ({ background: 'none', border: 'none', cursor: 'pointer', color: active ? '#818cf8' : '#94a3b8', fontSize: 20, padding: 8, borderRadius: 8 });

export function MediaControls({ isPlaying, shuffleEnabled, repeatMode, onPlay, onPause, onNext, onPrev, onShuffle, onRepeat }:
  { isPlaying: boolean; shuffleEnabled: boolean; repeatMode: RepeatMode; onPlay(): void; onPause(): void; onNext(): void; onPrev(): void; onShuffle(): void; onRepeat(): void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <button style={btn(shuffleEnabled)} onClick={onShuffle} title="Shuffle">🔀</button>
      <button style={btn()} onClick={onPrev} title="Previous">⏮</button>
      <button onClick={isPlaying ? onPause : onPlay}
        style={{ ...btn(), background: '#6366f1', color: '#fff', borderRadius: '50%', width: 52, height: 52, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button style={btn()} onClick={onNext} title="Next">⏭</button>
      <button style={btn(repeatMode !== 'off')} onClick={onRepeat} title="Repeat">
        {repeatMode === 'track' ? '🔂' : '🔁'}
      </button>
    </div>
  );
}

import React from 'react';

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function ProgressBar({ positionMs, durationMs, onSeek }: { positionMs: number; durationMs: number; onSeek: (ms: number) => void }) {
  return (
    <div style={{ width: '100%' }}>
      <input type="range" min={0} max={durationMs || 1} value={positionMs}
        onChange={e => onSeek(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer', height: 4 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 2 }}>
        <span>{fmt(positionMs)}</span>
        <span>-{fmt(Math.max(0, durationMs - positionMs))}</span>
      </div>
    </div>
  );
}

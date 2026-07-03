import React from 'react';
import { AlbumArt } from '@components/AlbumArt';
import type { Track } from '@database/index';

function fmt(ms: number) { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

export function QueueItem({ track, position, isActive, onClick }: { track: Track; position: number; isActive: boolean; onClick(): void }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 16px', cursor: 'pointer', background: isActive ? 'rgba(99,102,241,.15)' : 'transparent' }}>
      <span style={{ width: 22, textAlign: 'right', color: isActive ? '#818cf8' : '#475569', fontSize: 12, flexShrink: 0 }}>{isActive ? '▶' : position + 1}</span>
      <AlbumArt src={track.coverArtUrl} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: isActive ? '#818cf8' : '#e2e8f0', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
        <div style={{ color: '#475569', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</div>
      </div>
      <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}>{fmt(track.durationMs)}</span>
    </div>
  );
}

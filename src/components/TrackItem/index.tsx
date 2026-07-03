import React, { useState, useRef, useEffect } from 'react';
import { AlbumArt } from '@components/AlbumArt';
import type { Track } from '@database/index';

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

interface Props {
  track: Track;
  isActive?: boolean;
  index?: number;
  onClick: () => void;
  onAddToPlaylist?: (t: Track) => void;
}

export function TrackItem({ track, isActive, index, onClick, onAddToPlaylist }: Props) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOut(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }
    if (menuOpen) document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, [menuOpen]);

  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 16px', cursor: 'pointer',
        background: isActive ? 'rgba(99,102,241,.18)' : hover ? 'rgba(255,255,255,.04)' : 'transparent',
        borderLeft: `3px solid ${isActive ? '#6366f1' : 'transparent'}` }}>
      {index !== undefined && <span style={{ width: 20, textAlign: 'right', fontSize: 12, color: isActive ? '#818cf8' : '#475569', flexShrink: 0 }}>{isActive ? '▶' : index + 1}</span>}
      <AlbumArt src={track.coverArtUrl} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: isActive ? '#818cf8' : '#e2e8f0', fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 14 }}>{track.title}</div>
        <div style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist} · {track.album}</div>
      </div>
      <span style={{ fontSize: 12, color: '#475569', flexShrink: 0 }}>{fmt(track.durationMs)}</span>
      {onAddToPlaylist && (
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1 }}>⋮</button>
          {menuOpen && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: '100%', zIndex: 200, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '4px 0', minWidth: 180 }}>
              <button onClick={() => { onAddToPlaylist(track); setMenuOpen(false); }}
                style={{ display: 'block', width: '100%', padding: '9px 16px', background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', textAlign: 'left', fontSize: 13 }}>
                + Add to Playlist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

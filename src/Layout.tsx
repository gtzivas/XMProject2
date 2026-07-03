import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AudioPlayerService } from '@services/AudioPlayerService';
import { usePlaybackStore } from '@store/playbackStore';
import { AlbumArt } from '@components/AlbumArt';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@database/index';

const NAV_ITEMS = [
  { to: '/library', label: '🎵', title: 'Library' },
  { to: '/albums', label: '💿', title: 'Albums' },
  { to: '/artists', label: '🎤', title: 'Artists' },
  { to: '/search', label: '🔍', title: 'Search' },
  { to: '/playlists', label: '📋', title: 'Playlists' },
];

function MiniPlayer() {
  const navigate = useNavigate();
  const { currentTrackId, isPlaying } = usePlaybackStore();
  const track = useLiveQuery(() => currentTrackId ? db.tracks.get(currentTrackId) : undefined, [currentTrackId]);
  if (!track) return null;
  return (
    <div onClick={() => navigate('/now-playing')}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: '#1e293b', borderTop: '1px solid #334155', cursor: 'pointer', flexShrink: 0 }}>
      <AlbumArt src={track.coverArtUrl} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
        <div style={{ color: '#64748b', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</div>
      </div>
      <button onClick={e => { e.stopPropagation(); AudioPlayerService.togglePlayPause(); usePlaybackStore.getState().setIsPlaying(!isPlaying); }}
        style={{ background: 'none', border: 'none', color: '#e2e8f0', fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
}

export function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar nav */}
      <nav style={{ width: 64, background: '#0a0f1e', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 4, flexShrink: 0 }}>
        {NAV_ITEMS.map(n => (
          <NavLink key={n.to} to={n.to} title={n.title}
            style={({ isActive }) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', width: '100%', textDecoration: 'none', color: isActive ? '#818cf8' : '#475569', background: isActive ? 'rgba(99,102,241,.12)' : 'transparent', fontSize: 22, transition: 'color .15s' })}>
            <span>{n.label}</span>
            <span style={{ fontSize: 9, marginTop: 2 }}>{n.title}</span>
          </NavLink>
        ))}
      </nav>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}><Outlet /></div>
        <MiniPlayer />
      </div>
    </div>
  );
}

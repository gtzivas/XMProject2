import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Track } from '@database/index';
import { PlaylistService } from '@services/PlaylistService';

export function AddToPlaylistModal({ track, onClose }: { track: Track; onClose(): void }) {
  const [newName, setNewName] = useState('');
  const playlists = useLiveQuery(() => db.playlists.orderBy('name').toArray(), []) ?? [];

  async function addTo(playlistId: string) { await PlaylistService.addTrackToPlaylist(playlistId, track.id); onClose(); }
  async function createAndAdd() {
    if (!newName.trim()) return;
    const p = await PlaylistService.createPlaylist(newName.trim());
    await PlaylistService.addTrackToPlaylist(p.id, track.id);
    onClose();
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1e293b', borderRadius: 12, padding: 24, minWidth: 300, maxWidth: 380, width: '90vw' }}>
        <h3 style={{ margin: '0 0 4px', color: '#e2e8f0', fontSize: 16 }}>Add to Playlist</h3>
        <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 13 }}>{track.title}</p>
        {playlists.length > 0 && playlists.map(p => (
          <button key={p.id} onClick={() => addTo(p.id)}
            style={{ display: 'block', width: '100%', padding: '10px 12px', marginBottom: 6, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', cursor: 'pointer', textAlign: 'left', fontSize: 14 }}>
            {p.name}
          </button>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: playlists.length ? 12 : 0 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New playlist name…"
            onKeyDown={e => e.key === 'Enter' && createAndAdd()}
            style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
          <button onClick={createAndAdd} style={{ background: '#6366f1', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>+ New</button>
        </div>
        <button onClick={onClose} style={{ marginTop: 12, width: '100%', background: 'none', border: '1px solid #334155', borderRadius: 8, padding: '8px', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  );
}

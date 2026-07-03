import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@database/index';
import { PlaylistService } from '@services/PlaylistService';

export function PlaylistsPage() {
  const navigate = useNavigate();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const playlists = useLiveQuery(() => db.playlists.orderBy('name').toArray(), []) ?? [];
  const counts = useLiveQuery(async () => {
    const all = await db.playlistTracks.toArray();
    const m = new Map<string, number>();
    for (const pt of all) m.set(pt.playlistId, (m.get(pt.playlistId) ?? 0) + 1);
    return m;
  }, []);

  async function create() {
    if (!newName.trim()) return;
    await PlaylistService.createPlaylist(newName.trim());
    setNewName(''); setCreating(false);
  }

  async function del(id: string) {
    if (confirm('Delete this playlist?')) await PlaylistService.deletePlaylist(id);
  }

  async function rename(id: string, name: string) {
    if (name.trim()) await PlaylistService.renamePlaylist(id, name.trim());
    setRenaming(null);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <h2 style={{ margin: 0, color: '#e2e8f0', fontSize: 18 }}>Playlists</h2>
        <button onClick={() => setCreating(true)} style={{ background: '#6366f1', border: 'none', color: '#fff', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>+ New</button>
      </div>
      {creating && (
        <div style={{ padding: '10px 16px', background: '#1e293b', display: 'flex', gap: 8 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Playlist name" autoFocus
            onKeyDown={e => { if (e.key === 'Enter') create(); if (e.key === 'Escape') setCreating(false); }}
            style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '7px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
          <button onClick={create} style={{ background: '#6366f1', border: 'none', color: '#fff', borderRadius: 6, padding: '7px 14px', cursor: 'pointer' }}>Save</button>
          <button onClick={() => setCreating(false)} style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: 6, padding: '7px 12px', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {playlists.length === 0 && !creating && <div style={{ padding: '3rem', textAlign: 'center', color: '#334155' }}>No playlists yet. Create one above.</div>}
        {playlists.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #0f172a' }}>
            {renaming?.id === p.id
              ? <input value={renaming.name} onChange={e => setRenaming({ id: p.id, name: e.target.value })} autoFocus
                  onBlur={() => rename(p.id, renaming.name)} onKeyDown={e => { if (e.key === 'Enter') rename(p.id, renaming.name); if (e.key === 'Escape') setRenaming(null); }}
                  style={{ flex: 1, background: '#0f172a', border: '1px solid #6366f1', borderRadius: 6, padding: '4px 10px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
              : <div onClick={() => navigate(`/playlists/${p.id}`)} style={{ flex: 1, cursor: 'pointer' }}>
                  <div style={{ color: '#e2e8f0', fontWeight: 500 }}>{p.name}</div>
                  <div style={{ color: '#475569', fontSize: 12 }}>{counts?.get(p.id) ?? 0} tracks</div>
                </div>}
            <button onClick={() => setRenaming({ id: p.id, name: p.name })} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 15, padding: '0 6px' }} title="Rename">✏️</button>
            <button onClick={() => del(p.id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 15, padding: '0 6px' }} title="Delete">🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}

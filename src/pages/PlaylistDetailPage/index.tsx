import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Track } from '@database/index';
import { PlaylistService } from '@services/PlaylistService';
import { AudioPlayerService } from '@services/AudioPlayerService';
import { getObjectUrlForTrack } from '@services/MusicLibraryService';
import { TrackItem } from '@components/TrackItem';
import { usePlaybackStore } from '@store/playbackStore';
import { AddToPlaylistModal } from '../_shared/AddToPlaylistModal';

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTrackId } = usePlaybackStore();
  const [addTrack, setAddTrack] = useState<Track | null>(null);

  const playlist = useLiveQuery(() => id ? db.playlists.get(id) : undefined, [id]);
  const tracks = useLiveQuery(async () => {
    if (!id) return [];
    const pts = await db.playlistTracks.where('playlistId').equals(id).sortBy('position');
    const ts = (await db.tracks.bulkGet(pts.map(p => p.trackId))).filter(Boolean) as Track[];
    return ts;
  }, [id]) ?? [];

  async function play(i: number) {
    const at = tracks.map(t => ({ id: t.id, url: getObjectUrlForTrack(t) ?? '', title: t.title, artist: t.artist, album: t.album, durationMs: t.durationMs, artwork: t.coverArtUrl ?? undefined }));
    await AudioPlayerService.loadQueue(at, i);
    usePlaybackStore.getState().setCurrentTrackId(tracks[i]!.id);
    navigate('/now-playing');
  }

  async function remove(trackId: string) { if (id) await PlaylistService.removeTrackFromPlaylist(id, trackId); }

  if (!playlist) return <div style={{ padding: 32, color: '#475569' }}>Playlist not found.</div>;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <button onClick={() => navigate('/playlists')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 6 }}>←</button>
        <h2 style={{ margin: 0, color: '#e2e8f0', fontSize: 18 }}>{playlist.name}</h2>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{tracks.length} tracks</div>
      </div>
      {tracks.length > 0 && (
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          <button onClick={() => play(0)} style={{ background: '#6366f1', border: 'none', color: '#fff', borderRadius: 8, padding: '7px 18px', cursor: 'pointer', fontSize: 13 }}>▶ Play All</button>
          <button onClick={() => { AudioPlayerService.setShuffle(true); play(0); }} style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '7px 18px', cursor: 'pointer', fontSize: 13 }}>🔀 Shuffle</button>
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tracks.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#334155' }}>No tracks yet. Add some from the Library.</div>}
        {tracks.map((t, i) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <TrackItem track={t} index={i} isActive={t.id === currentTrackId} onClick={() => play(i)} onAddToPlaylist={setAddTrack} />
            </div>
            <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '0 12px', fontSize: 16 }} title="Remove">✕</button>
          </div>
        ))}
      </div>
      {addTrack && <AddToPlaylistModal track={addTrack} onClose={() => setAddTrack(null)} />}
    </div>
  );
}

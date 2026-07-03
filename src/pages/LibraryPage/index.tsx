import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Track } from '@database/index';
import { MusicLibraryService, getObjectUrlForTrack } from '@services/MusicLibraryService';
import { AudioPlayerService } from '@services/AudioPlayerService';
import { TrackItem } from '@components/TrackItem';
import { useLibraryStore } from '@store/libraryStore';
import { usePlaybackStore } from '@store/playbackStore';
import { AddToPlaylistModal } from '../_shared/AddToPlaylistModal';

export function LibraryPage() {
  const navigate = useNavigate();
  const { importStatus } = useLibraryStore();
  const { currentTrackId } = usePlaybackStore();
  const [addTrack, setAddTrack] = useState<Track | null>(null);
  const tracks = useLiveQuery(() => db.tracks.orderBy('title').toArray(), []) ?? [];

  async function play(track: Track, index: number) {
    const audioTracks = tracks.map(t => ({ id: t.id, url: getObjectUrlForTrack(t) ?? '', title: t.title, artist: t.artist, album: t.album, durationMs: t.durationMs, artwork: t.coverArtUrl ?? undefined }));
    await AudioPlayerService.loadQueue(audioTracks, index);
    usePlaybackStore.getState().setCurrentTrackId(track.id);
    usePlaybackStore.getState().setQueueTrackIds(tracks.map(t => t.id));
    navigate('/now-playing');
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <div><h2 style={{ margin: 0, color: '#e2e8f0', fontSize: 18 }}>Library</h2>{tracks.length > 0 && <span style={{ fontSize: 12, color: '#475569' }}>{tracks.length} tracks</span>}</div>
        <button onClick={() => MusicLibraryService.importFiles()}
          style={{ background: '#6366f1', border: 'none', color: '#fff', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>
          {importStatus === 'importing' ? 'Importing…' : tracks.length === 0 ? '+ Import Music' : '↻ Re-import'}
        </button>
      </div>
      {importStatus === 'importing' && <div style={{ padding: '6px 16px', background: '#312e81', color: '#a5b4fc', fontSize: 12 }}>Scanning files…</div>}
      {tracks.length === 0
        ? <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#334155', gap: 12 }}>
            <div style={{ fontSize: 56 }}>🎵</div>
            <p style={{ margin: 0, textAlign: 'center' }}>No music yet.<br />Click "Import Music" to load your audio files.</p>
          </div>
        : <div style={{ flex: 1, overflowY: 'auto' }}>
            {tracks.map((t, i) => <TrackItem key={t.id} track={t} index={i} isActive={t.id === currentTrackId} onClick={() => play(t, i)} onAddToPlaylist={setAddTrack} />)}
          </div>}
      {addTrack && <AddToPlaylistModal track={addTrack} onClose={() => setAddTrack(null)} />}
    </div>
  );
}

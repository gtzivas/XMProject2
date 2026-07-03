import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Track } from '@database/index';
import { getObjectUrlForTrack } from '@services/MusicLibraryService';
import { AudioPlayerService } from '@services/AudioPlayerService';
import { TrackItem } from '@components/TrackItem';
import { usePlaybackStore } from '@store/playbackStore';
import { AddToPlaylistModal } from '../_shared/AddToPlaylistModal';

export function ArtistsPage() {
  const navigate = useNavigate();
  const { currentTrackId } = usePlaybackStore();
  const [open, setOpen] = useState<string | null>(null);
  const [addTrack, setAddTrack] = useState<Track | null>(null);
  const tracks = useLiveQuery(() => db.tracks.orderBy('title').toArray(), []) ?? [];

  const artistMap = new Map<string, Track[]>();
  for (const t of tracks) { if (!artistMap.has(t.artist)) artistMap.set(t.artist, []); artistMap.get(t.artist)!.push(t); }
  const artists = [...artistMap.entries()].map(([a, ts]) => ({ artist: a, tracks: ts })).sort((a, b) => a.artist.localeCompare(b.artist));

  async function play(ts: Track[], i: number) {
    const at = ts.map(t => ({ id: t.id, url: getObjectUrlForTrack(t) ?? '', title: t.title, artist: t.artist, album: t.album, durationMs: t.durationMs, artwork: t.coverArtUrl ?? undefined }));
    await AudioPlayerService.loadQueue(at, i);
    usePlaybackStore.getState().setCurrentTrackId(ts[i]!.id);
    navigate('/now-playing');
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #1e293b' }}><h2 style={{ margin: 0, color: '#e2e8f0', fontSize: 18 }}>Artists</h2></div>
      {artists.map(a => (
        <div key={a.artist}>
          <div onClick={() => setOpen(open === a.artist ? null : a.artist)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer' }}>
            <div><div style={{ color: '#e2e8f0', fontWeight: 500 }}>{a.artist}</div><div style={{ color: '#475569', fontSize: 12 }}>{a.tracks.length} tracks</div></div>
            <span style={{ color: '#475569' }}>{open === a.artist ? '▲' : '▼'}</span>
          </div>
          {open === a.artist && a.tracks.map((t, i) => <TrackItem key={t.id} track={t} index={i} isActive={t.id === currentTrackId} onClick={() => play(a.tracks, i)} onAddToPlaylist={setAddTrack} />)}
        </div>
      ))}
      {addTrack && <AddToPlaylistModal track={addTrack} onClose={() => setAddTrack(null)} />}
    </div>
  );
}

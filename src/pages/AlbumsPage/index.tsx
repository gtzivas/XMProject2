import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Track } from '@database/index';
import { MusicLibraryService, getObjectUrlForTrack } from '@services/MusicLibraryService';
import { AudioPlayerService } from '@services/AudioPlayerService';
import { TrackItem } from '@components/TrackItem';
import { AlbumArt } from '@components/AlbumArt';
import { usePlaybackStore } from '@store/playbackStore';
import { AddToPlaylistModal } from '../_shared/AddToPlaylistModal';

export function AlbumsPage() {
  const navigate = useNavigate();
  const { currentTrackId } = usePlaybackStore();
  const [open, setOpen] = useState<string | null>(null);
  const [addTrack, setAddTrack] = useState<Track | null>(null);
  const tracks = useLiveQuery(() => db.tracks.orderBy('title').toArray(), []) ?? [];

  const albumMap = new Map<string, Track[]>();
  for (const t of tracks) {
    const k = `${t.album}|||${t.artist}`;
    if (!albumMap.has(k)) albumMap.set(k, []);
    albumMap.get(k)!.push(t);
  }
  const albums = [...albumMap.entries()].map(([k, ts]) => ({ key: k, album: ts[0]!.album, artist: ts[0]!.artist, cover: ts[0]!.coverArtUrl, tracks: ts })).sort((a, b) => a.album.localeCompare(b.album));

  async function play(albumTracks: Track[], idx: number) {
    const at = albumTracks.map(t => ({ id: t.id, url: getObjectUrlForTrack(t) ?? '', title: t.title, artist: t.artist, album: t.album, durationMs: t.durationMs, artwork: t.coverArtUrl ?? undefined }));
    await AudioPlayerService.loadQueue(at, idx);
    usePlaybackStore.getState().setCurrentTrackId(albumTracks[idx]!.id);
    navigate('/now-playing');
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #1e293b' }}><h2 style={{ margin: 0, color: '#e2e8f0', fontSize: 18 }}>Albums</h2></div>
      {albums.map(a => (
        <div key={a.key}>
          <div onClick={() => setOpen(open === a.key ? null : a.key)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer' }}>
            <AlbumArt src={a.cover} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#e2e8f0', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.album}</div>
              <div style={{ color: '#64748b', fontSize: 12 }}>{a.artist} · {a.tracks.length} tracks</div>
            </div>
            <span style={{ color: '#475569', fontSize: 14 }}>{open === a.key ? '▲' : '▼'}</span>
          </div>
          {open === a.key && a.tracks.map((t, i) => <TrackItem key={t.id} track={t} index={i} isActive={t.id === currentTrackId} onClick={() => play(a.tracks, i)} onAddToPlaylist={setAddTrack} />)}
        </div>
      ))}
      {addTrack && <AddToPlaylistModal track={addTrack} onClose={() => setAddTrack(null)} />}
    </div>
  );
}

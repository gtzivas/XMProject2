import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicLibraryService, getObjectUrlForTrack } from '@services/MusicLibraryService';
import { AudioPlayerService } from '@services/AudioPlayerService';
import { TrackItem } from '@components/TrackItem';
import { usePlaybackStore } from '@store/playbackStore';
import { type Track } from '@database/index';
import { AddToPlaylistModal } from '../_shared/AddToPlaylistModal';

export function SearchPage() {
  const navigate = useNavigate();
  const { currentTrackId } = usePlaybackStore();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [addTrack, setAddTrack] = useState<Track | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!q.trim()) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      const r = await MusicLibraryService.queryTracks({ search: q });
      setResults(r);
    }, 200);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [q]);

  async function play(track: Track, i: number) {
    const at = results.map(t => ({ id: t.id, url: getObjectUrlForTrack(t) ?? '', title: t.title, artist: t.artist, album: t.album, durationMs: t.durationMs, artwork: t.coverArtUrl ?? undefined }));
    await AudioPlayerService.loadQueue(at, i);
    usePlaybackStore.getState().setCurrentTrackId(track.id);
    navigate('/now-playing');
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tracks, artists, albums…" autoFocus
          style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {results.length === 0 && q.trim() && <div style={{ padding: '3rem', textAlign: 'center', color: '#334155' }}>No results for "{q}"</div>}
        {results.map((t, i) => <TrackItem key={t.id} track={t} index={i} isActive={t.id === currentTrackId} onClick={() => play(t, i)} onAddToPlaylist={setAddTrack} />)}
      </div>
      {addTrack && <AddToPlaylistModal track={addTrack} onClose={() => setAddTrack(null)} />}
    </div>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AudioPlayerService, type PlaybackStatus } from '@services/AudioPlayerService';
import { AlbumArt } from '@components/AlbumArt';
import { ProgressBar } from '@components/ProgressBar';
import { MediaControls } from '@components/MediaControls';
import { usePlaybackStore, type RepeatMode } from '@store/playbackStore';
import { db, type Track } from '@database/index';

function cycleRepeat(m: RepeatMode): RepeatMode { return m === 'off' ? 'track' : m === 'track' ? 'queue' : 'off'; }

export function NowPlayingPage() {
  const navigate = useNavigate();
  const { volume, setVolume, shuffleEnabled, setShuffleEnabled, repeatMode, setRepeatMode, persist } = usePlaybackStore();
  const [status, setStatus] = useState<PlaybackStatus | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AudioPlayerService.getStatus().then(setStatus);
    const unsub = AudioPlayerService.onPlaybackStatusChange(async (s) => {
      setStatus(s);
      if (s.trackId) { const t = await db.tracks.get(s.trackId); setTrack(t ?? null); }
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(), 5000);
    });
    return () => { unsub(); if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', gap: 20, maxWidth: 440, margin: '0 auto' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 22 }}>←</button>
        <span style={{ color: '#94a3b8', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Now Playing</span>
        <button onClick={() => navigate('/queue')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>Queue</button>
      </div>

      <AlbumArt src={track?.coverArtUrl ?? null} size={260} style={{ borderRadius: 12 }} />

      <div style={{ width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track?.title ?? 'Nothing playing'}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{track?.artist}{track?.album ? ` · ${track.album}` : ''}</div>
      </div>

      <ProgressBar positionMs={status?.positionMs ?? 0} durationMs={status?.durationMs ?? 0} onSeek={ms => AudioPlayerService.seekTo(ms)} />

      <MediaControls
        isPlaying={status?.isPlaying ?? false} shuffleEnabled={shuffleEnabled} repeatMode={repeatMode}
        onPlay={() => AudioPlayerService.play()} onPause={() => AudioPlayerService.pause()}
        onNext={() => AudioPlayerService.skipToNext()} onPrev={() => AudioPlayerService.skipToPrevious()}
        onShuffle={() => { const n = !shuffleEnabled; setShuffleEnabled(n); AudioPlayerService.setShuffle(n); }}
        onRepeat={() => { const n = cycleRepeat(repeatMode); setRepeatMode(n); AudioPlayerService.setRepeatMode(n); }}
      />

      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>🔈</span>
        <input type="range" min={0} max={1} step={0.01} value={volume}
          onChange={e => { const v = +e.target.value; setVolume(v); AudioPlayerService.setVolume(v); }}
          style={{ flex: 1, accentColor: '#6366f1' }} />
        <span>🔊</span>
      </div>
    </div>
  );
}

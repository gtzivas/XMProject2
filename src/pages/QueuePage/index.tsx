import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AudioPlayerService } from '@services/AudioPlayerService';
import { QueueItem } from '@components/QueueItem';
import { db, type Track } from '@database/index';
import { usePlaybackStore } from '@store/playbackStore';

export function QueuePage() {
  const navigate = useNavigate();
  const { currentTrackId } = usePlaybackStore();
  const [queue, setQueue] = useState<Track[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    async function refresh() {
      const raw = AudioPlayerService.getCurrentQueue();
      const idx = AudioPlayerService.getActualIndex();
      setActiveIdx(idx);
      const tracks = (await db.tracks.bulkGet(raw.map(t => t.id))).filter(Boolean) as Track[];
      setQueue(tracks);
    }
    refresh();
    return AudioPlayerService.onPlaybackStatusChange(() => refresh());
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #1e293b' }}>
        <button onClick={() => navigate('/now-playing')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>←</button>
        <h2 style={{ margin: 0, color: '#e2e8f0', fontSize: 18 }}>Queue</h2>
        <span style={{ color: '#475569', fontSize: 13 }}>{queue.length} tracks</span>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
        {queue.map((t, i) => (
          <QueueItem key={`${t.id}-${i}`} track={t} position={i} isActive={i === activeIdx}
            onClick={() => { AudioPlayerService.skipToIndex(i); navigate('/now-playing'); }} />
        ))}
      </div>
    </div>
  );
}

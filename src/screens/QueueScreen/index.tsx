import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import { QueueItem } from '@components/QueueItem';
import { AudioPlayerService } from '@services/AudioPlayerService';
import { usePlaybackStore } from '@store/playbackStore';
import { database } from '@database/index';
import { Track } from '@database/models/Track';
import { Q } from '@nozbe/watermelondb';

// T024: QueueScreen

export function QueueScreen() {
  const activeTrack = useActiveTrack();
  const queueIds = usePlaybackStore(s => s.queueTrackIds);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (queueIds.length === 0) { setTracks([]); return; }
    database.get<Track>('tracks').query(Q.where('id', Q.oneOf(queueIds))).fetch()
      .then(results => {
        const sorted = queueIds.map(id => results.find(t => t.id === id)).filter(Boolean) as Track[];
        setTracks(sorted);
      });
  }, [queueIds]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Queue</Text>
      <FlatList
        data={tracks}
        keyExtractor={t => t.id}
        renderItem={({ item, index }) => (
          <QueueItem
            position={index}
            title={item.title}
            artist={item.artist}
            coverArtUri={item.coverArtUri}
            isActive={item.id === activeTrack?.id}
            onPress={() => AudioPlayerService.skipToIndex(index)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Queue is empty</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  heading: { color: '#fff', fontSize: 18, fontWeight: '700', padding: 16 },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },
});

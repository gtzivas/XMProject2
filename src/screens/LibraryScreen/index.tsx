import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TrackItem } from '@components/TrackItem';
import { MusicLibraryService } from '@services/MusicLibraryService';
import { AudioPlayerService } from '@services/AudioPlayerService';
import { useLibraryStore } from '@store/libraryStore';
import { database } from '@database/index';
import { Track } from '@database/models/Track';
import type { Track as TrackModel } from '@database/models/Track';

// T032 + T036 + T039: LibraryScreen

export function LibraryScreen() {
  const navigation = useNavigation<any>();
  const scanStatus = useLibraryStore(s => s.scanStatus);
  const [tracks, setTracks] = useState<TrackModel[]>([]);

  useEffect(() => {
    const unsub = MusicLibraryService.onScanProgress(async () => {
      const all = await MusicLibraryService.queryTracks({ sortBy: 'title', sortOrder: 'asc' } as any);
      setTracks(all);
    });
    return unsub;
  }, []);

  // Initial load from DB on mount
  useEffect(() => {
    MusicLibraryService.queryTracks().then(setTracks);
  }, []);

  const handleTrackPress = useCallback(async (track: TrackModel, index: number) => {
    await AudioPlayerService.loadQueue(
      tracks.map(t => ({
        id: t.id, url: `file://${t.filePath}`, title: t.title,
        artist: t.artist, album: t.album, durationMs: t.durationMs,
        artwork: t.coverArtUri ?? undefined,
      })),
      index
    );
    navigation.navigate('NowPlaying');
  }, [tracks, navigation]);

  // T039: manual refresh
  const handleRefresh = useCallback(() => {
    useLibraryStore.getState().setScanStatus('scanning');
    MusicLibraryService.scan();
  }, []);

  const isEmpty = scanStatus === 'complete' && tracks.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Library</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>
      {scanStatus === 'scanning' && (
        <View style={styles.banner}>
          <ActivityIndicator size="small" color="#1db954" />
          <Text style={styles.bannerText}>Scanning library…</Text>
        </View>
      )}
      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No music found</Text>
          <Text style={styles.emptyHint}>Add audio files to your device and tap ↻ to refresh.</Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={t => t.id}
          renderItem={({ item, index }) => (
            <TrackItem
              id={item.id}
              title={item.title}
              artist={item.artist}
              album={item.album}
              durationMs={item.durationMs}
              coverArtUri={item.coverArtUri}
              onPress={() => handleTrackPress(item, index)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '700' },
  refreshBtn: { padding: 8 },
  refreshText: { color: '#1db954', fontSize: 20 },
  banner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  bannerText: { color: '#aaa', fontSize: 13 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyHint: { color: '#aaa', fontSize: 14, textAlign: 'center' },
});

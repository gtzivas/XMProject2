import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'; // T045 D1 fix
import { useNavigation, useRoute } from '@react-navigation/native';
import { TrackItem } from '@components/TrackItem';
import { PlaylistService } from '@services/PlaylistService';
import { AudioPlayerService } from '@services/AudioPlayerService';
import type { Track } from '@database/models/Track';

// T045 + T047: PlaylistDetailScreen

export function PlaylistDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { playlistId, playlistName } = route.params as { playlistId: string; playlistName: string };
  const [tracks, setTracks] = useState<Track[]>([]);

  const refresh = useCallback(() => {
    PlaylistService.getPlaylistWithTracks(playlistId).then(data => {
      if (data) setTracks(data.tracks);
    });
  }, [playlistId]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDragEnd = useCallback(async ({ data }: { data: Track[] }) => {
    setTracks(data);
    await PlaylistService.reorderTracks(playlistId, data.map(t => t.id));
  }, [playlistId]);

  const handleRemove = useCallback(async (trackId: string) => {
    await PlaylistService.removeTrackFromPlaylist(playlistId, trackId);
    refresh();
  }, [playlistId, refresh]);

  const handlePlay = useCallback(async (startIndex: number) => {
    await AudioPlayerService.loadQueue(
      tracks.map(t => ({ id: t.id, url: `file://${t.filePath}`, title: t.title, artist: t.artist, album: t.album, durationMs: t.durationMs, artwork: t.coverArtUri ?? undefined })),
      startIndex
    );
    navigation.navigate('NowPlaying');
  }, [tracks, navigation]);

  const handleShuffle = useCallback(async () => {
    AudioPlayerService.setShuffle(true);
    await handlePlay(Math.floor(Math.random() * tracks.length));
  }, [tracks, handlePlay]);

  const renderItem = useCallback(({ item, drag, isActive, getIndex }: RenderItemParams<Track>) => (
    <TrackItem
      id={item.id} title={item.title} artist={item.artist} album={item.album}
      durationMs={item.durationMs} coverArtUri={item.coverArtUri}
      isActive={isActive}
      onPress={() => handlePlay(getIndex?.() ?? 0)}
      onLongPress={drag}
      rightSlot={
        <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      }
    />
  ), [handlePlay, handleRemove]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{playlistName}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handlePlay(0)} style={styles.actionBtn}>
          <Text style={styles.actionText}>▶ Play All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShuffle} style={styles.actionBtn}>
          <Text style={styles.actionText}>⇌ Shuffle</Text>
        </TouchableOpacity>
      </View>
      <DraggableFlatList
        data={tracks}
        keyExtractor={t => t.id}
        onDragEnd={handleDragEnd}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  heading: { color: '#fff', fontSize: 20, fontWeight: '700', padding: 16, paddingTop: 56 },
  actions: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  actionBtn: { backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  actionText: { color: '#1db954', fontSize: 14, fontWeight: '600' },
  removeBtn: { padding: 8 },
  removeText: { color: '#555', fontSize: 14 },
});

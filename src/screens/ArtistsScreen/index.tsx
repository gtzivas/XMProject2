import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TrackItem } from '@components/TrackItem';
import { MusicLibraryService } from '@services/MusicLibraryService';
import { AudioPlayerService } from '@services/AudioPlayerService';
import type { Track } from '@database/models/Track';

// T034 + T036: ArtistsScreen

interface ArtistSection { title: string; data: Track[]; }

export function ArtistsScreen() {
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<ArtistSection[]>([]);

  useEffect(() => {
    MusicLibraryService.getArtists().then(async (artists) => {
      const secs: ArtistSection[] = [];
      for (const artist of artists) {
        const tracks = await MusicLibraryService.queryTracks({ artist } as any);
        if (tracks.length > 0) secs.push({ title: artist, data: tracks });
      }
      setSections(secs);
    });
  }, []);

  const handlePress = useCallback(async (track: Track, allTracks: Track[], index: number) => {
    await AudioPlayerService.loadQueue(
      allTracks.map(t => ({ id: t.id, url: `file://${t.filePath}`, title: t.title, artist: t.artist, album: t.album, durationMs: t.durationMs, artwork: t.coverArtUri ?? undefined })),
      index
    );
    navigation.navigate('NowPlaying');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Artists</Text>
      <SectionList
        sections={sections}
        keyExtractor={t => t.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item, index, section }) => (
          <TrackItem
            id={item.id} title={item.title} artist={item.artist} album={item.album}
            durationMs={item.durationMs} coverArtUri={item.coverArtUri}
            onPress={() => handlePress(item, section.data, index)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  heading: { color: '#fff', fontSize: 22, fontWeight: '700', padding: 16, paddingTop: 56 },
  sectionHeader: { color: '#aaa', fontSize: 13, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#0a0a0a', textTransform: 'uppercase', letterSpacing: 0.5 },
});

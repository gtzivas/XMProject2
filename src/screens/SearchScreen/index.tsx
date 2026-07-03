import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TrackItem } from '@components/TrackItem';
import { MusicLibraryService } from '@services/MusicLibraryService';
import { AudioPlayerService } from '@services/AudioPlayerService';
import type { Track } from '@database/models/Track';

// T035 + T037: SearchScreen

export function SearchScreen() {
  const navigation = useNavigation<any>();
  const [results, setResults] = useState<Track[]>([]);
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (text.trim().length === 0) { setResults([]); return; }
      const found = await MusicLibraryService.queryTracks({ search: text } as any);
      setResults(found);
    }, 200);
  }, []);

  const handlePress = useCallback(async (track: Track, index: number) => {
    await AudioPlayerService.loadQueue(
      results.map(t => ({ id: t.id, url: `file://${t.filePath}`, title: t.title, artist: t.artist, album: t.album, durationMs: t.durationMs, artwork: t.coverArtUri ?? undefined })),
      index
    );
    navigation.navigate('NowPlaying');
  }, [results, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Search title, artist, album…"
          placeholderTextColor="#555"
          value={query}
          onChangeText={handleChangeText}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={t => t.id}
        renderItem={({ item, index }) => (
          <TrackItem
            id={item.id} title={item.title} artist={item.artist} album={item.album}
            durationMs={item.durationMs} coverArtUri={item.coverArtUri}
            onPress={() => handlePress(item, index)}
          />
        )}
        ListEmptyComponent={
          query.length > 0
            ? <Text style={styles.empty}>No results for "{query}"</Text>
            : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inputWrap: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 8 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 10, color: '#fff', fontSize: 16, paddingHorizontal: 14, paddingVertical: 10 },
  empty: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 14 },
});

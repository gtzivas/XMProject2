import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Slider } from 'react-native';
import { useProgress, usePlaybackState, useActiveTrack, State } from 'react-native-track-player';
import { AlbumArt } from '@components/AlbumArt';
import { ProgressBar } from '@components/ProgressBar';
import { MediaControls } from '@components/MediaControls';
import { AudioPlayerService } from '@services/AudioPlayerService';
import { usePlaybackStore } from '@store/playbackStore';
import type { RepeatModeValue } from '@services/AudioPlayerService';

// T022 + T025 + T026: NowPlayingScreen

export function NowPlayingScreen() {
  const { position, duration } = useProgress(500);
  const { state } = usePlaybackState();
  const activeTrack = useActiveTrack();
  const shuffleEnabled = usePlaybackStore(s => s.shuffleEnabled);
  const repeatMode = usePlaybackStore(s => s.repeatMode);
  const volume = usePlaybackStore(s => s.volume);

  const isPlaying = state === State.Playing;

  const handleSeek = useCallback((posMs: number) => {
    AudioPlayerService.seekTo(posMs);
  }, []);

  const handleVolume = useCallback((v: number) => {
    AudioPlayerService.setVolume(v);
  }, []);

  const handleRepeatCycle = useCallback(() => {
    const next: RepeatModeValue = repeatMode === 'off' ? 'track' : repeatMode === 'track' ? 'queue' : 'off';
    AudioPlayerService.setRepeatMode(next);
  }, [repeatMode]);

  return (
    <View style={styles.container}>
      <AlbumArt uri={activeTrack?.artwork} size={280} borderRadius={12} />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{activeTrack?.title ?? '—'}</Text>
        <Text style={styles.artist} numberOfLines={1}>{activeTrack?.artist ?? '—'}</Text>
        <Text style={styles.album} numberOfLines={1}>{activeTrack?.album ?? '—'}</Text>
      </View>
      <ProgressBar
        positionMs={position * 1000}
        durationMs={duration * 1000}
        onSeek={handleSeek}
      />
      <MediaControls
        isPlaying={isPlaying}
        shuffleEnabled={shuffleEnabled}
        repeatMode={repeatMode}
        onPlay={AudioPlayerService.play}
        onPause={AudioPlayerService.pause}
        onNext={AudioPlayerService.skipToNext}
        onPrevious={AudioPlayerService.skipToPrevious}
        onShuffleToggle={() => AudioPlayerService.setShuffle(!shuffleEnabled)}
        onRepeatCycle={handleRepeatCycle}
      />
      <View style={styles.volumeRow}>
        <Text style={styles.volIcon}>🔈</Text>
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={handleVolume}
          minimumTrackTintColor="#1db954"
          maximumTrackTintColor="#444"
          thumbTintColor="#fff"
        />
        <Text style={styles.volIcon}>🔊</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', paddingTop: 48, paddingBottom: 32 },
  meta: { width: '100%', paddingHorizontal: 24, marginVertical: 20, alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  artist: { color: '#aaa', fontSize: 15, marginTop: 4, textAlign: 'center' },
  album: { color: '#666', fontSize: 13, marginTop: 2, textAlign: 'center' },
  volumeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, width: '100%', marginTop: 16 },
  volumeSlider: { flex: 1, marginHorizontal: 8 },
  volIcon: { fontSize: 16 },
});

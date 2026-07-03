// Mock for react-native-track-player
const TrackPlayer = {
  setupPlayer: jest.fn().mockResolvedValue(undefined),
  add: jest.fn().mockResolvedValue(undefined),
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  reset: jest.fn().mockResolvedValue(undefined),
  seekTo: jest.fn().mockResolvedValue(undefined),
  setVolume: jest.fn().mockResolvedValue(undefined),
  skipToNext: jest.fn().mockResolvedValue(undefined),
  skipToPrevious: jest.fn().mockResolvedValue(undefined),
  skip: jest.fn().mockResolvedValue(undefined),
  getQueue: jest.fn().mockResolvedValue([]),
  getCurrentTrack: jest.fn().mockResolvedValue(null),
  getActiveTrackIndex: jest.fn().mockResolvedValue(null),
  getProgress: jest.fn().mockResolvedValue({ position: 0, duration: 0, buffered: 0 }),
  getVolume: jest.fn().mockResolvedValue(1),
  updateMetadataForTrack: jest.fn().mockResolvedValue(undefined),
  removeUpcomingTracks: jest.fn().mockResolvedValue(undefined),
  setRepeatMode: jest.fn().mockResolvedValue(undefined),
  getRepeatMode: jest.fn().mockResolvedValue(0),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  registerPlaybackService: jest.fn(),
};

export const useTrackPlayerEvents = jest.fn(() => undefined);
export const useProgress = jest.fn(() => ({ position: 0, duration: 0, buffered: 0 }));
export const usePlaybackState = jest.fn(() => ({ state: 'none' }));
export const useActiveTrack = jest.fn(() => undefined);
export const Event = { PlaybackState: 'playback-state', PlaybackError: 'playback-error', PlaybackActiveTrackChanged: 'playback-active-track-changed', RemotePlay: 'remote-play', RemotePause: 'remote-pause', RemoteNext: 'remote-next', RemotePrevious: 'remote-previous', RemoteSeek: 'remote-seek' };
export const State = { Playing: 'playing', Paused: 'paused', Stopped: 'stopped', Idle: 'idle', Buffering: 'buffering', Loading: 'loading', Ready: 'ready', Error: 'error' };
export const RepeatMode = { Off: 0, Track: 1, Queue: 2 };
export const Capability = { Play: 'play', Pause: 'pause', Stop: 'stop', SeekTo: 'seekTo', SkipToNext: 'skipToNext', SkipToPrevious: 'skipToPrevious' };

export default TrackPlayer;

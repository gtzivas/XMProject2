import Dexie from 'dexie';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  filePath: string;
  coverArtUrl: string | null;
  fileSize: number;
  mimeType: string;
  lastModified: number;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface PlaylistTrack {
  id: string;
  playlistId: string;
  trackId: string;
  position: number;
}

class MusicDB extends Dexie {
  tracks!: Dexie.Table<Track, string>;
  playlists!: Dexie.Table<Playlist, string>;
  playlistTracks!: Dexie.Table<PlaylistTrack, string>;

  constructor() {
    super('MusicPlayerDB');
    this.version(1).stores({
      tracks: 'id, filePath, artist, album, [artist+album]',
      playlists: 'id, name',
      playlistTracks: 'id, playlistId, trackId, [playlistId+position]',
    });
    // v2: add title index (required for orderBy('title'))
    this.version(2).stores({
      tracks: 'id, filePath, title, artist, album, [artist+album]',
      playlists: 'id, name',
      playlistTracks: 'id, playlistId, trackId, [playlistId+position]',
    });
  }
}

export const db = new MusicDB();

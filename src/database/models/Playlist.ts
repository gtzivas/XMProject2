import { Model } from '@nozbe/watermelondb';
import { field, date, children, writer } from '@nozbe/watermelondb/decorators';
import type { PlaylistTrack } from './PlaylistTrack';

// T009: Playlist WatermelonDB model
export class Playlist extends Model {
  static table = 'playlists';
  static associations = {
    playlist_tracks: { type: 'has_many' as const, foreignKey: 'playlist_id' },
  };

  @field('name') name!: string;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @children('playlist_tracks') playlistTracks!: PlaylistTrack[];

  @writer async rename(newName: string): Promise<void> {
    await this.update((record) => {
      record.name = newName;
    });
  }
}

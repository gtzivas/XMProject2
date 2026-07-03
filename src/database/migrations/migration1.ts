import { appSchema, tableSchema } from '@nozbe/watermelondb';

// T007: Migration 1 — full initial schema
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tracks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'artist', type: 'string' },
        { name: 'album', type: 'string' },
        { name: 'duration_ms', type: 'number' },
        { name: 'file_path', type: 'string' },
        { name: 'cover_art_uri', type: 'string', isOptional: true },
        { name: 'file_size', type: 'number' },
        { name: 'mime_type', type: 'string' },
        { name: 'last_modified', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'playlists',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'playlist_tracks',
      columns: [
        { name: 'playlist_id', type: 'string', isIndexed: true },
        { name: 'track_id', type: 'string', isIndexed: true },
        { name: 'position', type: 'number' },
      ],
    }),
  ],
});

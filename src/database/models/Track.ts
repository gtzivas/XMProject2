import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, writer } from '@nozbe/watermelondb/decorators';

// T008: Track WatermelonDB model
export class Track extends Model {
  static table = 'tracks';

  @field('title') title!: string;
  @field('artist') artist!: string;
  @field('album') album!: string;
  @field('duration_ms') durationMs!: number;
  @field('file_path') filePath!: string;
  @field('cover_art_uri') coverArtUri!: string | null;
  @field('file_size') fileSize!: number;
  @field('mime_type') mimeType!: string;
  @field('last_modified') lastModified!: number;

  @writer async updateMetadata(data: Partial<{
    title: string;
    artist: string;
    album: string;
    durationMs: number;
    coverArtUri: string | null;
    lastModified: number;
  }>): Promise<void> {
    await this.update((record) => {
      if (data.title !== undefined) record.title = data.title;
      if (data.artist !== undefined) record.artist = data.artist;
      if (data.album !== undefined) record.album = data.album;
      if (data.durationMs !== undefined) record.durationMs = data.durationMs;
      if (data.coverArtUri !== undefined) record.coverArtUri = data.coverArtUri;
      if (data.lastModified !== undefined) record.lastModified = data.lastModified;
    });
  }
}

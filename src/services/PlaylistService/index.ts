import { db, type Playlist, type Track } from '@database/index';

export const PlaylistService = {
  async createPlaylist(name: string): Promise<Playlist> {
    const p: Playlist = { id: crypto.randomUUID(), name, createdAt: Date.now(), updatedAt: Date.now() };
    await db.playlists.add(p); return p;
  },
  async renamePlaylist(id: string, name: string) {
    await db.playlists.update(id, { name, updatedAt: Date.now() });
  },
  async deletePlaylist(id: string) {
    await db.transaction('rw', db.playlists, db.playlistTracks, async () => {
      await db.playlistTracks.where('playlistId').equals(id).delete();
      await db.playlists.delete(id);
    });
  },
  async getAllPlaylists() { return db.playlists.orderBy('name').toArray(); },
  async getPlaylistWithTracks(playlistId: string): Promise<{ playlist: Playlist; tracks: Track[] } | null> {
    const playlist = await db.playlists.get(playlistId);
    if (!playlist) return null;
    const pts = await db.playlistTracks.where('playlistId').equals(playlistId).sortBy('position');
    const tracks = (await db.tracks.bulkGet(pts.map(p => p.trackId))).filter(Boolean) as Track[];
    return { playlist, tracks };
  },
  async addTrackToPlaylist(playlistId: string, trackId: string) {
    const ex = await db.playlistTracks.where('playlistId').equals(playlistId).and(p => p.trackId === trackId).first();
    if (ex) return;
    const count = await db.playlistTracks.where('playlistId').equals(playlistId).count();
    await db.playlistTracks.add({ id: crypto.randomUUID(), playlistId, trackId, position: count });
    await db.playlists.update(playlistId, { updatedAt: Date.now() });
  },
  async removeTrackFromPlaylist(playlistId: string, trackId: string) {
    await db.transaction('rw', db.playlistTracks, async () => {
      await db.playlistTracks.where('playlistId').equals(playlistId).and(p => p.trackId === trackId).delete();
      const rem = await db.playlistTracks.where('playlistId').equals(playlistId).sortBy('position');
      for (let i = 0; i < rem.length; i++) await db.playlistTracks.update(rem[i]!.id, { position: i });
    });
  },
  async reorderTracks(playlistId: string, orderedIds: string[]) {
    await db.transaction('rw', db.playlistTracks, async () => {
      const pts = await db.playlistTracks.where('playlistId').equals(playlistId).toArray();
      const map = new Map(pts.map(p => [p.trackId, p]));
      for (let i = 0; i < orderedIds.length; i++) {
        const pt = map.get(orderedIds[i]!);
        if (pt) await db.playlistTracks.update(pt.id, { position: i });
      }
    });
  },
};

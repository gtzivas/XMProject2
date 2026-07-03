import { db, type Track } from '@database/index';
import { useLibraryStore } from '@store/libraryStore';

type ProgressCb = (done: number, total: number, track: Track) => void;

const AUDIO_EXTS = /\.(mp3|aac|m4a|flac|wav|ogg|opus|wma)$/i;
const fileCache = new Map<string, File>();

export function getFileForTrack(fp: string): File | undefined { return fileCache.get(fp); }

export function getObjectUrlForTrack(track: Track): string | null {
  const f = fileCache.get(track.filePath);
  return f ? URL.createObjectURL(f) : null;
}

function makeFilePath(f: File) { return `${f.name}|${f.size}|${f.lastModified}`; }

async function parseTrack(file: File): Promise<Track | null> {
  try {
    const { parseBlob } = await import('music-metadata-browser');
    const meta = await parseBlob(file, { skipCovers: false });
    const { common: c, format } = meta;
    let coverArtUrl: string | null = null;
    if (c.picture?.[0]) {
      const pic = c.picture[0]!;
      coverArtUrl = URL.createObjectURL(new Blob([pic.data], { type: pic.format }));
    }
    return {
      id: crypto.randomUUID(),
      title: c.title || file.name.replace(/\.[^.]+$/, ''),
      artist: c.artist || 'Unknown Artist',
      album: c.album || 'Unknown Album',
      durationMs: format.duration ? Math.round(format.duration * 1000) : 0,
      filePath: makeFilePath(file),
      coverArtUrl,
      fileSize: file.size,
      mimeType: file.type || 'audio/mpeg',
      lastModified: file.lastModified,
    };
  } catch { return null; }
}

async function collectFromDir(handle: FileSystemDirectoryHandle): Promise<File[]> {
  const out: File[] = [];
  for await (const entry of (handle as any).values()) {
    if (entry.kind === 'file') { out.push(await entry.getFile()); }
    else if (entry.kind === 'directory') { out.push(...await collectFromDir(entry)); }
  }
  return out;
}

function pickViaInput(): Promise<File[]> {
  return new Promise(resolve => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.multiple = true; inp.accept = 'audio/*';
    inp.onchange = () => resolve(Array.from(inp.files ?? []));
    inp.click();
  });
}

export const MusicLibraryService = {
  async importFiles(onProgress?: ProgressCb) {
    const store = useLibraryStore.getState();
    store.setImportStatus('importing');
    let files: File[] = [];
    try {
      if ('showDirectoryPicker' in window) {
        const dir = await (window as any).showDirectoryPicker({ mode: 'read' });
        files = await collectFromDir(dir);
      } else { files = await pickViaInput(); }
    } catch (e: any) {
      if (e?.name === 'AbortError') { store.setImportStatus('idle'); return; }
      files = await pickViaInput();
    }
    const audio = files.filter(f => AUDIO_EXTS.test(f.name) || f.type.startsWith('audio/'));
    if (!audio.length) { store.setImportStatus('complete'); return; }
    fileCache.clear();
    let done = 0;
    for (const file of audio) {
      const track = await parseTrack(file);
      if (track) {
        fileCache.set(track.filePath, file);
        const ex = await db.tracks.where('filePath').equals(track.filePath).first();
        if (ex) await db.tracks.update(ex.id, { ...track, id: ex.id });
        else await db.tracks.add(track);
        done++;
        store.setTrackCount(done);
        onProgress?.(done, audio.length, track);
      }
    }
    store.setTrackCount(await db.tracks.count());
    store.setImportStatus('complete');
  },

  async queryTracks(opts?: { search?: string; artist?: string; album?: string }): Promise<Track[]> {
    if (opts?.artist) return db.tracks.where('artist').equals(opts.artist).sortBy('title');
    if (opts?.album) return db.tracks.where('album').equals(opts.album).sortBy('title');
    const all = await db.tracks.orderBy('title').toArray();
    if (opts?.search) {
      const q = opts.search.toLowerCase();
      return all.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q));
    }
    return all;
  },

  async getTrackById(id: string) { return db.tracks.get(id); },
  async getArtists(): Promise<string[]> {
    const all = await db.tracks.toArray();
    return [...new Set(all.map(t => t.artist))].sort();
  },
  async getAlbums() {
    const all = await db.tracks.toArray();
    const map = new Map<string, { album: string; artist: string; coverArtUrl: string | null }>();
    for (const t of all) {
      const key = `${t.album}|||${t.artist}`;
      if (!map.has(key)) map.set(key, { album: t.album, artist: t.artist, coverArtUrl: t.coverArtUrl });
    }
    return [...map.values()].sort((a, b) => a.album.localeCompare(b.album));
  },
  async getTrackCount() { return db.tracks.count(); },
};

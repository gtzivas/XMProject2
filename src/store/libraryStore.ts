import { create } from 'zustand';

export type ImportStatus = 'idle' | 'importing' | 'complete';

interface LibraryStore {
  importStatus: ImportStatus;
  trackCount: number;
  setImportStatus: (s: ImportStatus) => void;
  setTrackCount: (n: number) => void;
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  importStatus: 'idle',
  trackCount: 0,
  setImportStatus: (s) => set({ importStatus: s }),
  setTrackCount: (n) => set({ trackCount: n }),
}));

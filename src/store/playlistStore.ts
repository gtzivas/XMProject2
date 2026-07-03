import { create } from 'zustand';

interface PlaylistStore {
  editingPlaylistId: string | null;
  isRenaming: boolean;
  setEditingPlaylist: (id: string | null) => void;
  setIsRenaming: (v: boolean) => void;
  clearEditing: () => void;
}

export const usePlaylistStore = create<PlaylistStore>((set) => ({
  editingPlaylistId: null,
  isRenaming: false,
  setEditingPlaylist: (id) => set({ editingPlaylistId: id }),
  setIsRenaming: (v) => set({ isRenaming: v }),
  clearEditing: () => set({ editingPlaylistId: null, isRenaming: false }),
}));

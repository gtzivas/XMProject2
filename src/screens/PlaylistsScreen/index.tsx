import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PlaylistService } from '@services/PlaylistService';

// T044 + T048: PlaylistsScreen

interface PlaylistSummary { id: string; name: string; trackCount: number; updatedAt: Date; }

export function PlaylistsScreen() {
  const navigation = useNavigation<any>();
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const refresh = useCallback(() => {
    PlaylistService.getAllPlaylists().then(setPlaylists);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    await PlaylistService.createPlaylist(newName.trim());
    setNewName(''); setShowCreate(false); refresh();
  }, [newName, refresh]);

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert('Delete Playlist', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await PlaylistService.deletePlaylist(id); refresh(); } },
    ]);
  }, [refresh]);

  const handleRename = useCallback((id: string, current: string) => {
    Alert.prompt?.('Rename Playlist', 'Enter new name', async (newN) => {
      if (newN?.trim()) { await PlaylistService.renamePlaylist(id, newN.trim()); refresh(); }
    }, 'plain-text', current);
  }, [refresh]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Playlists</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.fab}>
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={playlists}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('PlaylistDetail', { playlistId: item.id, playlistName: item.name })}
            onLongPress={() => handleRename(item.id, item.name)}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.count}>{item.trackCount} {item.trackCount === 1 ? 'track' : 'tracks'}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No playlists yet. Tap ＋ to create one.</Text>}
      />
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput style={styles.modalInput} placeholder="Playlist name" placeholderTextColor="#555" value={newName} onChangeText={setNewName} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => { setShowCreate(false); setNewName(''); }}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleCreate}><Text style={styles.confirm}>Create</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 56 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '700' },
  fab: { backgroundColor: '#1db954', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: '#fff', fontSize: 22, lineHeight: 28 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1a1a1a' },
  info: { flex: 1 },
  name: { color: '#fff', fontSize: 16, fontWeight: '600' },
  count: { color: '#aaa', fontSize: 13, marginTop: 2 },
  deleteBtn: { padding: 8 },
  deleteText: { color: '#555', fontSize: 16 },
  empty: { color: '#666', textAlign: 'center', marginTop: 60, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 24, width: 300 },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 16 },
  modalInput: { backgroundColor: '#111', color: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24 },
  cancel: { color: '#aaa', fontSize: 15 },
  confirm: { color: '#1db954', fontSize: 15, fontWeight: '600' },
});

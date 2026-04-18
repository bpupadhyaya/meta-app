import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, StyleSheet } from 'react-native';
import { ScreenDefinition } from '../../schema/types';

interface ScreenListPanelProps {
  screens: ScreenDefinition[];
  selectedIndex: number;
  onSelectScreen: (index: number) => void;
  onAddScreen: (name: string, title: string) => void;
  onDeleteScreen: (index: number) => void;
  onUpdateTitle: (index: number, title: string) => void;
  onClose: () => void;
}

export function ScreenListPanel({
  screens, selectedIndex, onSelectScreen, onAddScreen, onDeleteScreen, onUpdateTitle, onClose,
}: ScreenListPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAddScreen(newTitle.trim(), newTitle.trim());
    setNewTitle('');
    setShowAdd(false);
  };

  const handleDelete = (index: number) => {
    if (screens.length <= 1) {
      Alert.alert('Cannot Delete', 'Your app must have at least one screen.');
      return;
    }
    Alert.alert('Delete Screen', `Delete "${screens[index].title}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteScreen(index) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Screens</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowAdd(!showAdd)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showAdd && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Screen name"
            placeholderTextColor="#94A3B8"
            autoFocus
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity onPress={handleAdd} style={styles.addConfirmBtn}>
            <Text style={styles.addConfirmText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={screens}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.screenItem, index === selectedIndex && styles.screenItemSelected]}
            onPress={() => onSelectScreen(index)}
            onLongPress={() => handleDelete(index)}
          >
            <Text style={[styles.screenName, index === selectedIndex && styles.screenNameSelected]}>
              {item.title}
            </Text>
            <Text style={styles.screenInfo}>
              {countComponents(item.rootComponent)} components
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

function countComponents(node: { children?: any[] }): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countComponents(child);
    }
  }
  return count;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B' },
  headerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  addBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  addBtnText: { fontSize: 15, color: '#6366F1', fontWeight: '500' },
  closeButton: { paddingVertical: 4, paddingHorizontal: 8 },
  closeText: { fontSize: 15, color: '#6366F1', fontWeight: '500' },
  addRow: {
    flexDirection: 'row', padding: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  addInput: {
    flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: '#1E293B',
  },
  addConfirmBtn: {
    backgroundColor: '#6366F1', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center',
  },
  addConfirmText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  list: { padding: 12, gap: 6 },
  screenItem: {
    padding: 14, borderRadius: 10, backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  screenItemSelected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  screenName: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  screenNameSelected: { color: '#6366F1' },
  screenInfo: { fontSize: 12, color: '#94A3B8' },
});

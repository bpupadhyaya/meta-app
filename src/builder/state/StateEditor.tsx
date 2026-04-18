import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert, StyleSheet } from 'react-native';
import { StateVariable } from '../../schema/types';

interface StateEditorProps {
  stateVars: Record<string, StateVariable>;
  onAdd: (name: string, variable: StateVariable) => void;
  onDelete: (name: string) => void;
  onClose: () => void;
}

const STATE_TYPES: Array<{ label: string; value: StateVariable['type'] }> = [
  { label: 'Text', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'List', value: 'array' },
  { label: 'Object', value: 'object' },
];

export function StateEditor({ stateVars, onAdd, onDelete, onClose }: StateEditorProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<StateVariable['type']>('string');
  const [newPersist, setNewPersist] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const name = newName.trim().replace(/\s+/g, '_');
    const defaults: Record<string, unknown> = {
      string: '', number: 0, boolean: false, array: [], object: {},
    };
    onAdd(name, { type: newType, defaultValue: defaults[newType], persist: newPersist });
    setNewName('');
    setNewType('string');
    setNewPersist(false);
    setShowAdd(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>State Variables</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowAdd(!showAdd)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showAdd && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.addInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="Variable name"
            placeholderTextColor="#94A3B8"
            autoFocus
            autoCapitalize="none"
          />
          <View style={styles.typeRow}>
            {STATE_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeChip, newType === t.value && styles.typeChipActive]}
                onPress={() => setNewType(t.value)}
              >
                <Text style={[styles.typeChipText, newType === t.value && styles.typeChipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.persistRow}>
            <Text style={styles.persistLabel}>Save to device</Text>
            <Switch value={newPersist} onValueChange={setNewPersist} trackColor={{ false: '#CBD5E1', true: '#6366F1' }} thumbColor="#FFF" />
          </View>
          <TouchableOpacity onPress={handleAdd} style={styles.addConfirmBtn}>
            <Text style={styles.addConfirmText}>Add Variable</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.list}>
        {Object.entries(stateVars).length === 0 && (
          <Text style={styles.emptyText}>No state variables yet. Add one to store data in your app.</Text>
        )}
        {Object.entries(stateVars).map(([name, variable]) => (
          <View key={name} style={styles.varItem}>
            <View style={styles.varInfo}>
              <Text style={styles.varName}>{name}</Text>
              <View style={styles.varMeta}>
                <Text style={styles.varType}>{variable.type}</Text>
                {variable.persist && <Text style={styles.varPersist}>saved</Text>}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Delete', `Delete "${name}"?`, [
                { text: 'Cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(name) },
              ])}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B' },
  headerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  addBtn: { paddingVertical: 4 },
  addBtnText: { fontSize: 15, color: '#6366F1', fontWeight: '500' },
  closeText: { fontSize: 15, color: '#6366F1', fontWeight: '500' },
  addForm: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 12 },
  addInput: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1E293B',
  },
  typeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  typeChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  typeChipText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  typeChipTextActive: { color: '#FFFFFF' },
  persistRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  persistLabel: { fontSize: 14, color: '#475569' },
  addConfirmBtn: { backgroundColor: '#6366F1', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  addConfirmText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  list: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 32 },
  varItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  varInfo: { flex: 1 },
  varName: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  varMeta: { flexDirection: 'row', gap: 6, marginTop: 2 },
  varType: { fontSize: 12, color: '#94A3B8', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  varPersist: { fontSize: 12, color: '#22C55E', backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  deleteText: { fontSize: 14, color: '#EF4444', fontWeight: '500' },
});

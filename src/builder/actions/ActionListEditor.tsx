import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { ActionDefinition, ActionStep } from '../../schema/types';
import { generateId } from '../../utils/idGenerator';

interface ActionListEditorProps {
  actions: Record<string, ActionDefinition>;
  onAdd: (action: ActionDefinition) => void;
  onDelete: (actionId: string) => void;
  onClose: () => void;
}

const ACTION_STEP_TYPES = [
  { type: 'setState', label: 'Set State', desc: 'Change a value' },
  { type: 'navigate', label: 'Navigate', desc: 'Go to screen' },
  { type: 'alert', label: 'Alert', desc: 'Show dialog' },
  { type: 'dbInsert', label: 'DB Insert', desc: 'Save to database' },
  { type: 'dbQuery', label: 'DB Query', desc: 'Read from database' },
  { type: 'dbUpdate', label: 'DB Update', desc: 'Update in database' },
  { type: 'dbDelete', label: 'DB Delete', desc: 'Delete from database' },
];

export function ActionListEditor({ actions, onAdd, onDelete, onClose }: ActionListEditorProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedStepType, setSelectedStepType] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const id = newName.trim().replace(/\s+/g, '_').toLowerCase();
    const steps: ActionStep[] = [];

    if (selectedStepType) {
      steps.push(createDefaultStep(selectedStepType));
    }

    onAdd({ id, name: newName.trim(), steps });
    setNewName('');
    setSelectedStepType(null);
    setShowAdd(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Actions</Text>
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
            placeholder="Action name (e.g. addItem)"
            placeholderTextColor="#94A3B8"
            autoFocus
            autoCapitalize="none"
          />
          <Text style={styles.stepTypeLabel}>First step type:</Text>
          <View style={styles.stepTypeGrid}>
            {ACTION_STEP_TYPES.map((s) => (
              <TouchableOpacity
                key={s.type}
                style={[styles.stepTypeCard, selectedStepType === s.type && styles.stepTypeCardActive]}
                onPress={() => setSelectedStepType(s.type)}
              >
                <Text style={[styles.stepTypeName, selectedStepType === s.type && styles.stepTypeNameActive]}>{s.label}</Text>
                <Text style={[styles.stepTypeDesc, selectedStepType === s.type && styles.stepTypeDescActive]}>{s.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={handleAdd} style={styles.addConfirmBtn}>
            <Text style={styles.addConfirmText}>Create Action</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.list}>
        {Object.keys(actions).length === 0 && (
          <Text style={styles.emptyText}>No actions yet. Actions define what happens when users interact with your app.</Text>
        )}
        {Object.entries(actions).map(([id, action]) => (
          <View key={id} style={styles.actionItem}>
            <View style={styles.actionInfo}>
              <Text style={styles.actionName}>{action.name}</Text>
              <Text style={styles.actionSteps}>{action.steps.length} step{action.steps.length !== 1 ? 's' : ''}</Text>
              {action.steps.length > 0 && (
                <View style={styles.stepPreview}>
                  {action.steps.slice(0, 3).map((step, i) => (
                    <Text key={i} style={styles.stepPreviewText}>{i + 1}. {step.type}</Text>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Delete', `Delete "${action.name}"?`, [
                { text: 'Cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(id) },
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

function createDefaultStep(type: string): ActionStep {
  switch (type) {
    case 'setState': return { type: 'setState', key: '', value: '' };
    case 'navigate': return { type: 'navigate', screen: '', mode: 'push' };
    case 'alert': return { type: 'alert', title: 'Alert', message: 'Message' };
    case 'dbInsert': return { type: 'dbInsert', table: '', data: {} };
    case 'dbQuery': return { type: 'dbQuery', table: '', resultKey: '' };
    case 'dbUpdate': return { type: 'dbUpdate', table: '', data: {}, where: {} };
    case 'dbDelete': return { type: 'dbDelete', table: '', where: {} };
    default: return { type: 'setState', key: '', value: '' };
  }
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
  stepTypeLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  stepTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stepTypeCard: {
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
  },
  stepTypeCardActive: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  stepTypeName: { fontSize: 13, fontWeight: '600', color: '#475569' },
  stepTypeNameActive: { color: '#6366F1' },
  stepTypeDesc: { fontSize: 11, color: '#94A3B8' },
  stepTypeDescActive: { color: '#818CF8' },
  addConfirmBtn: { backgroundColor: '#6366F1', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  addConfirmText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  list: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 32 },
  actionItem: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  actionInfo: { flex: 1 },
  actionName: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  actionSteps: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  stepPreview: { marginTop: 4 },
  stepPreviewText: { fontSize: 12, color: '#64748B' },
  deleteText: { fontSize: 14, color: '#EF4444', fontWeight: '500' },
});

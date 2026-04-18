import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, SafeAreaView, TextInput, Modal, StyleSheet } from 'react-native';
import { AppDefinition } from '../schema/types';
import { ProjectDatabase, SavedProject } from '../runtime/storage/ProjectDatabase';
import { templates } from '../templates';
import { generateId } from '../utils/idGenerator';
import { createDefaultApp } from '../schema/defaults';

interface ProjectListScreenProps {
  onOpenBuilder: (definition: AppDefinition, projectId: string) => void;
  onPreview: (definition: AppDefinition) => void;
}

const projectDb = new ProjectDatabase();

export function ProjectListScreen({ onOpenBuilder, onPreview }: ProjectListScreenProps) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const all = projectDb.getAllProjects();
    setProjects(all);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = generateId();
    const template = templates.find((t) => t.id === selectedTemplate)?.template ?? createDefaultApp(newName.trim());
    const definition: AppDefinition = {
      ...template,
      app: { ...template.app, id, name: newName.trim().toLowerCase().replace(/\s+/g, '-'), displayName: newName.trim() },
    };
    projectDb.saveProject(id, newName.trim(), definition);
    setNewName('');
    setShowCreate(false);
    loadProjects();
    onOpenBuilder(definition, id);
  };

  const handleOpen = (project: SavedProject) => {
    const definition = projectDb.parseDefinition(project);
    onOpenBuilder(definition, project.id);
  };

  const handlePreview = (project: SavedProject) => {
    const definition = projectDb.parseDefinition(project);
    onPreview(definition);
  };

  const handleDelete = (project: SavedProject) => {
    Alert.alert('Delete Project', `Delete "${project.name}"? This cannot be undone.`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { projectDb.deleteProject(project.id); loadProjects(); } },
    ]);
  };

  const handleExport = (project: SavedProject) => {
    const json = projectDb.exportProject(project.id);
    if (json) {
      Alert.alert('Export', 'App definition copied to clipboard (in production, this would use Share sheet).');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>MetaApp</Text>
          <Text style={styles.subtitle}>Your apps</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.createBtn}>
          <Text style={styles.createBtnText}>+ New App</Text>
        </TouchableOpacity>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No apps yet</Text>
          <Text style={styles.emptySubtitle}>Create your first app to get started</Text>
          <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Create App</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.projectCard}>
              <TouchableOpacity style={styles.projectInfo} onPress={() => handleOpen(item)}>
                <Text style={styles.projectName}>{item.name}</Text>
                <Text style={styles.projectDate}>Updated {formatDate(item.updatedAt)}</Text>
              </TouchableOpacity>
              <View style={styles.projectActions}>
                <TouchableOpacity onPress={() => handlePreview(item)} style={styles.projectActionBtn}>
                  <Text style={styles.projectActionText}>Run</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleOpen(item)} style={styles.projectActionBtn}>
                  <Text style={styles.projectActionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleExport(item)} style={styles.projectActionBtn}>
                  <Text style={styles.projectActionText}>Export</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.projectActionBtn}>
                  <Text style={[styles.projectActionText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Create modal */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New App</Text>
            <TouchableOpacity onPress={handleCreate}>
              <Text style={styles.modalCreate}>Create</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>App Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="My Awesome App"
              placeholderTextColor="#94A3B8"
              autoFocus
            />

            <Text style={[styles.modalLabel, { marginTop: 24 }]}>Start From</Text>
            {templates.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.templateOption, selectedTemplate === t.id && styles.templateOptionActive]}
                onPress={() => setSelectedTemplate(t.id)}
              >
                <Text style={[styles.templateName, selectedTemplate === t.id && styles.templateNameActive]}>{t.name}</Text>
                <Text style={styles.templateDesc}>{t.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 15, color: '#64748B', marginTop: 2 },
  createBtn: {
    backgroundColor: '#6366F1', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10,
  },
  createBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '600', color: '#1E293B' },
  emptySubtitle: { fontSize: 15, color: '#64748B', marginTop: 6, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: '#6366F1', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20,
  },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  list: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  projectCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  projectInfo: { marginBottom: 10 },
  projectName: { fontSize: 17, fontWeight: '600', color: '#1E293B' },
  projectDate: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  projectActions: { flexDirection: 'row', gap: 8 },
  projectActionBtn: {
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F1F5F9', borderRadius: 6,
  },
  projectActionText: { fontSize: 13, color: '#6366F1', fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  modalCancel: { fontSize: 16, color: '#64748B' },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B' },
  modalCreate: { fontSize: 16, color: '#6366F1', fontWeight: '600' },
  modalContent: { padding: 24 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  modalInput: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 17, color: '#1E293B',
  },
  templateOption: {
    padding: 14, borderRadius: 10, backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8,
  },
  templateOptionActive: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  templateName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  templateNameActive: { color: '#6366F1' },
  templateDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
});

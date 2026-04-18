import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { AppDefinition } from '../../schema/types';

interface AppSettingsEditorProps {
  appDef: AppDefinition;
  onUpdateMeta: (meta: Partial<AppDefinition['app']>) => void;
  onUpdateNavType: (type: 'stack' | 'tabs') => void;
  onClose: () => void;
}

export function AppSettingsEditor({ appDef, onUpdateMeta, onUpdateNavType, onClose }: AppSettingsEditorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>App Settings</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeText}>Done</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionTitle}>General</Text>
        <FieldRow label="App Name" value={appDef.app.displayName} onChange={(v) => onUpdateMeta({ displayName: v })} />
        <FieldRow label="Description" value={appDef.app.description} onChange={(v) => onUpdateMeta({ description: v })} multiline />
        <FieldRow label="Version" value={appDef.app.version} onChange={(v) => onUpdateMeta({ version: v })} />
        <FieldRow label="Author" value={appDef.app.author} onChange={(v) => onUpdateMeta({ author: v })} />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Navigation</Text>
        <View style={styles.navTypeRow}>
          <TouchableOpacity
            style={[styles.navTypeBtn, appDef.navigation.type === 'stack' && styles.navTypeBtnActive]}
            onPress={() => onUpdateNavType('stack')}
          >
            <Text style={[styles.navTypeBtnText, appDef.navigation.type === 'stack' && styles.navTypeBtnTextActive]}>Stack</Text>
            <Text style={styles.navTypeDesc}>Push/pop with back button</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navTypeBtn, appDef.navigation.type === 'tabs' && styles.navTypeBtnActive]}
            onPress={() => onUpdateNavType('tabs')}
          >
            <Text style={[styles.navTypeBtnText, appDef.navigation.type === 'tabs' && styles.navTypeBtnTextActive]}>Tabs</Text>
            <Text style={styles.navTypeDesc}>Bottom tab bar</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Info</Text>
        <InfoRow label="App ID" value={appDef.app.id} />
        <InfoRow label="Schema" value={appDef.$schema} />
        <InfoRow label="Created" value={formatDate(appDef.app.createdAt)} />
        <InfoRow label="Updated" value={formatDate(appDef.app.updatedAt)} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function FieldRow({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { height: 60, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        placeholder={label}
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B' },
  closeText: { fontSize: 15, color: '#6366F1', fontWeight: '500' },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  fieldInput: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1E293B',
  },
  navTypeRow: { flexDirection: 'row', gap: 10 },
  navTypeBtn: {
    flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  navTypeBtnActive: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
  navTypeBtnText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  navTypeBtnTextActive: { color: '#6366F1' },
  navTypeDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 14, color: '#64748B' },
  infoValue: { fontSize: 14, color: '#1E293B', flex: 1, textAlign: 'right', marginLeft: 12 },
});

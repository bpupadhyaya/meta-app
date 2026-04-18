import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { ThemeDefinition } from '../../schema/types';

interface ThemeEditorProps {
  theme: ThemeDefinition;
  onUpdateColors: (colors: Record<string, string>) => void;
}

const COLOR_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  background: 'Background',
  surface: 'Surface',
  text: 'Text',
  textSecondary: 'Text Secondary',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
};

export function ThemeEditor({ theme, onUpdateColors }: ThemeEditorProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Colors</Text>
      {Object.entries(COLOR_LABELS).map(([key, label]) => (
        <View key={key} style={styles.colorRow}>
          <View style={styles.colorInfo}>
            <View style={[styles.colorSwatch, { backgroundColor: theme.colors[key] ?? '#CCC' }]} />
            <Text style={styles.colorLabel}>{label}</Text>
          </View>
          <TextInput
            style={styles.colorInput}
            value={theme.colors[key] ?? ''}
            onChangeText={(val) => onUpdateColors({ [key]: val })}
            placeholder="#000000"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Typography</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Font Family</Text>
        <Text style={styles.infoValue}>{theme.typography.fontFamily}</Text>
      </View>
      {Object.entries(theme.typography.sizes).map(([size, value]) => (
        <View key={size} style={styles.infoRow}>
          <Text style={styles.infoLabel}>Size {size.toUpperCase()}</Text>
          <Text style={styles.infoValue}>{value}px</Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Spacing</Text>
      {Object.entries(theme.spacing).map(([size, value]) => (
        <View key={size} style={styles.infoRow}>
          <Text style={styles.infoLabel}>{size.toUpperCase()}</Text>
          <Text style={styles.infoValue}>{value}px</Text>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  colorRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  colorInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorSwatch: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  colorLabel: { fontSize: 14, color: '#475569' },
  colorInput: {
    width: 90, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, fontSize: 13, color: '#1E293B',
    backgroundColor: '#F8FAFC', textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 14, color: '#475569' },
  infoValue: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
});

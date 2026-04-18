import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ComponentRegistry } from '../../runtime/registry/ComponentRegistry';

interface ComponentPaletteProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  primitive: 'Basic',
  layout: 'Layout',
  form: 'Forms',
  media: 'Media',
  custom: 'Custom',
};

const COMPONENT_ICONS: Record<string, string> = {
  text: 'Aa',
  button: '[ ]',
  image: '🖼',
  input: '___',
  switch: '⊘',
  view: '□',
  scrollview: '⇕',
  card: '▢',
  spacer: '↕',
  checkbox: '☑',
};

export function ComponentPalette({ onSelect, onClose }: ComponentPaletteProps) {
  const allComponents = ComponentRegistry.getAll();
  const categories = new Map<string, Array<{ type: string; displayName: string }>>();

  for (const [type, reg] of allComponents) {
    const cat = reg.category;
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push({ type, displayName: reg.displayName });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Component</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Done</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {Array.from(categories.entries()).map(([category, components]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category] ?? category}</Text>
            <View style={styles.grid}>
              {components.map(({ type, displayName }) => (
                <TouchableOpacity
                  key={type}
                  style={styles.componentCard}
                  onPress={() => onSelect(type)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.componentIcon}>{COMPONENT_ICONS[type] ?? '◻'}</Text>
                  <Text style={styles.componentName}>{displayName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  closeText: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  categorySection: {
    marginTop: 16,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  componentCard: {
    width: '30%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  componentIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: '#475569',
  },
  componentName: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
});

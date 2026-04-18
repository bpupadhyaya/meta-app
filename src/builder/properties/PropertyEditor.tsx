import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { ComponentNode, StyleDefinition } from '../../schema/types';
import { ComponentRegistry, PropSchema } from '../../runtime/registry/ComponentRegistry';

interface PropertyEditorProps {
  component: ComponentNode;
  onUpdateProps: (componentId: string, props: Record<string, unknown>) => void;
  onUpdateStyle: (componentId: string, style: StyleDefinition) => void;
  onClose: () => void;
}

export function PropertyEditor({ component, onUpdateProps, onUpdateStyle, onClose }: PropertyEditorProps) {
  const registration = ComponentRegistry.get(component.type);
  if (!registration) return null;

  const editableProps = registration.editableProps;
  const groups = groupProps(editableProps);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{registration.displayName}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Done</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Component-specific props */}
        {Object.entries(groups).map(([group, props]) => (
          <View key={group} style={styles.group}>
            <Text style={styles.groupTitle}>{group}</Text>
            {props.map((prop) => (
              <PropEditor
                key={prop.name}
                schema={prop}
                value={component.props[prop.name]}
                onChange={(val) => onUpdateProps(component.id, { [prop.name]: val })}
              />
            ))}
          </View>
        ))}

        {/* Layout styles */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Layout</Text>
          <SelectField
            label="Direction"
            value={component.style?.layout?.flexDirection ?? 'column'}
            options={[
              { label: 'Column', value: 'column' },
              { label: 'Row', value: 'row' },
            ]}
            onChange={(val) => onUpdateStyle(component.id, { layout: { ...component.style?.layout, flexDirection: val as any } })}
          />
          <SelectField
            label="Align"
            value={(component.style?.layout?.alignItems as string) ?? 'stretch'}
            options={[
              { label: 'Stretch', value: 'stretch' },
              { label: 'Start', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'End', value: 'flex-end' },
            ]}
            onChange={(val) => onUpdateStyle(component.id, { layout: { ...component.style?.layout, alignItems: val } })}
          />
          <SelectField
            label="Justify"
            value={(component.style?.layout?.justifyContent as string) ?? 'flex-start'}
            options={[
              { label: 'Start', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'End', value: 'flex-end' },
              { label: 'Between', value: 'space-between' },
              { label: 'Around', value: 'space-around' },
            ]}
            onChange={(val) => onUpdateStyle(component.id, { layout: { ...component.style?.layout, justifyContent: val } })}
          />
          <NumberField
            label="Flex"
            value={component.style?.layout?.flex}
            onChange={(val) => onUpdateStyle(component.id, { layout: { ...component.style?.layout, flex: val } })}
          />
        </View>

        {/* Spacing */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Spacing</Text>
          <NumberField
            label="Padding"
            value={component.style?.spacing?.padding as number}
            onChange={(val) => onUpdateStyle(component.id, { spacing: { ...component.style?.spacing, padding: val } })}
          />
          <NumberField
            label="Margin"
            value={component.style?.spacing?.margin as number}
            onChange={(val) => onUpdateStyle(component.id, { spacing: { ...component.style?.spacing, margin: val } })}
          />
          <NumberField
            label="Margin Bottom"
            value={component.style?.spacing?.marginBottom as number}
            onChange={(val) => onUpdateStyle(component.id, { spacing: { ...component.style?.spacing, marginBottom: val } })}
          />
        </View>

        {/* Appearance */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Appearance</Text>
          <TextField
            label="Background"
            value={(component.style?.appearance?.backgroundColor as string) ?? ''}
            onChange={(val) => onUpdateStyle(component.id, { appearance: { ...component.style?.appearance, backgroundColor: val } })}
          />
          <NumberField
            label="Border Radius"
            value={component.style?.appearance?.borderRadius as number}
            onChange={(val) => onUpdateStyle(component.id, { appearance: { ...component.style?.appearance, borderRadius: val } })}
          />
          <NumberField
            label="Border Width"
            value={component.style?.appearance?.borderWidth}
            onChange={(val) => onUpdateStyle(component.id, { appearance: { ...component.style?.appearance, borderWidth: val } })}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ---- Individual prop editors ----

function PropEditor({ schema, value, onChange }: { schema: PropSchema; value: unknown; onChange: (val: unknown) => void }) {
  switch (schema.type) {
    case 'string':
      return <TextField label={schema.label} value={String(value ?? '')} onChange={onChange} />;
    case 'number':
      return <NumberField label={schema.label} value={value as number} onChange={onChange} />;
    case 'boolean':
      return <BooleanField label={schema.label} value={Boolean(value)} onChange={onChange} />;
    case 'color':
      return <TextField label={schema.label} value={String(value ?? '')} onChange={onChange} />;
    case 'select':
      return (
        <SelectField
          label={schema.label}
          value={String(value ?? '')}
          options={schema.options ?? []}
          onChange={onChange}
        />
      );
    default:
      return <TextField label={schema.label} value={String(value ?? '')} onChange={onChange} />;
  }
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}

function NumberField({ label, value, onChange }: { label: string; value?: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, { width: 80 }]}
        value={value != null ? String(value) : ''}
        onChangeText={(t) => { const n = parseFloat(t); if (!isNaN(n)) onChange(n); else if (t === '') onChange(0); }}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}

function BooleanField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: '#CBD5E1', true: '#6366F1' }} thumbColor="#FFF" />
    </View>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Array<{ label: string; value: string }>; onChange: (v: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.selectRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.selectOption, value === opt.value && styles.selectOptionActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.selectOptionText, value === opt.value && styles.selectOptionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function groupProps(props: PropSchema[]): Record<string, PropSchema[]> {
  const groups: Record<string, PropSchema[]> = {};
  for (const prop of props) {
    const group = prop.group ?? 'General';
    if (!groups[group]) groups[group] = [];
    groups[group].push(prop);
  }
  return groups;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B' },
  closeButton: { paddingVertical: 4, paddingHorizontal: 12 },
  closeText: { fontSize: 15, color: '#6366F1', fontWeight: '500' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  group: { marginTop: 16 },
  groupTitle: { fontSize: 13, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  field: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  fieldLabel: { fontSize: 14, color: '#475569', flex: 1 },
  textInput: {
    flex: 1, maxWidth: 200, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, color: '#1E293B',
    backgroundColor: '#F8FAFC', textAlign: 'right',
  },
  selectRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  selectOption: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  selectOptionActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  selectOptionText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  selectOptionTextActive: { color: '#FFFFFF' },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, Alert, StyleSheet } from 'react-native';
import { AppDefinition, ModuleManifest } from '../../schema/types';
import { ModuleLoader } from '../../modules/ModuleLoader';
import { generateId } from '../../utils/idGenerator';

interface ModuleEditorProps {
  appDef: AppDefinition;
  onUpdateDef: (def: AppDefinition) => void;
  onClose: () => void;
}

const loader = new ModuleLoader();

export function ModuleEditor({ appDef, onUpdateDef, onClose }: ModuleEditorProps) {
  const [availableModules, setAvailableModules] = useState<Array<{ projectId: string; name: string; manifest: ModuleManifest }>>([]);
  const hasManifest = !!appDef.module;

  useEffect(() => {
    setAvailableModules(loader.listAvailableModules().filter((m) => m.manifest.moduleId !== appDef.app.id));
  }, [appDef.app.id]);

  const toggleManifest = (enabled: boolean) => {
    if (enabled) {
      onUpdateDef({
        ...appDef,
        module: {
          moduleId: appDef.app.id,
          version: appDef.app.version,
          exposedScreens: appDef.screens.map((s) => s.name),
          exposedActions: Object.keys(appDef.actions),
          inputProps: {},
          outputEvents: [],
          dependencies: [],
        },
      });
    } else {
      const newDef = { ...appDef };
      delete newDef.module;
      onUpdateDef(newDef);
    }
  };

  const addModuleComponent = (projectId: string, moduleName: string) => {
    // Add a ModuleHost component to the current screen's root
    const screenIndex = 0;
    const screen = appDef.screens[screenIndex];
    if (!screen) return;

    const moduleNode = {
      id: generateId(),
      type: 'view',
      props: {
        text: `[Module: ${moduleName}]`,
        _moduleProjectId: projectId,
      } as Record<string, import('../../schema/types').PropValue>,
      style: {
        layout: { flex: 1 },
        spacing: { padding: 8 },
        appearance: { backgroundColor: '#F0F0FF', borderRadius: 8, borderWidth: 1, borderColor: '#C7D2FE' },
      },
      children: [{
        id: generateId(),
        type: 'text',
        props: { text: `Embedded: ${moduleName}`, variant: 'caption' } as Record<string, import('../../schema/types').PropValue>,
      }],
    };

    const newScreens = [...appDef.screens];
    newScreens[screenIndex] = {
      ...screen,
      rootComponent: {
        ...screen.rootComponent,
        children: [...(screen.rootComponent.children ?? []), moduleNode],
      },
    };
    onUpdateDef({ ...appDef, screens: newScreens });
    Alert.alert('Module Added', `"${moduleName}" has been embedded in your first screen.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Modules</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Expose as module */}
        <Text style={styles.sectionTitle}>Expose This App</Text>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Make available as module</Text>
            <Text style={styles.toggleDesc}>Other apps can embed this app</Text>
          </View>
          <Switch
            value={hasManifest}
            onValueChange={toggleManifest}
            trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
            thumbColor="#FFF"
          />
        </View>

        {hasManifest && appDef.module && (
          <View style={styles.manifestInfo}>
            <InfoRow label="Module ID" value={appDef.module.moduleId} />
            <InfoRow label="Version" value={appDef.module.version} />
            <InfoRow label="Exposed Screens" value={appDef.module.exposedScreens.join(', ') || 'None'} />
            <InfoRow label="Exposed Actions" value={appDef.module.exposedActions.join(', ') || 'None'} />
          </View>
        )}

        {/* Embed other modules */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Embed Modules</Text>
        {availableModules.length === 0 ? (
          <Text style={styles.emptyText}>
            No modules available. Create another app and enable "Make available as module" to embed it here.
          </Text>
        ) : (
          availableModules.map((mod) => (
            <View key={mod.projectId} style={styles.moduleCard}>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleName}>{mod.name}</Text>
                <Text style={styles.moduleVersion}>v{mod.manifest.version}</Text>
                <Text style={styles.moduleScreens}>
                  {mod.manifest.exposedScreens.length} screen{mod.manifest.exposedScreens.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => addModuleComponent(mod.projectId, mod.name)}
                style={styles.embedBtn}
              >
                <Text style={styles.embedBtnText}>Embed</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B' },
  closeText: { fontSize: 15, color: '#6366F1', fontWeight: '500' },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0',
  },
  toggleLabel: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  toggleDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  manifestInfo: { marginTop: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: { fontSize: 13, color: '#64748B' },
  infoValue: { fontSize: 13, color: '#1E293B', fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingVertical: 24 },
  moduleCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  moduleInfo: { flex: 1 },
  moduleName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  moduleVersion: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  moduleScreens: { fontSize: 12, color: '#64748B', marginTop: 1 },
  embedBtn: {
    backgroundColor: '#6366F1', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  embedBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});

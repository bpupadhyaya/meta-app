import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Modal, StyleSheet } from 'react-native';
import { AppDefinition } from '../schema/types';
import { useBuilderState } from './hooks/useBuilderState';
import { ScreenCanvas } from './canvas/ScreenCanvas';
import { ComponentPalette } from './palette/ComponentPalette';
import { PropertyEditor } from './properties/PropertyEditor';
import { ScreenListPanel } from './screens/ScreenListPanel';
import { ThemeEditor } from './theme/ThemeEditor';
import { StateEditor } from './state/StateEditor';
import { ActionListEditor } from './actions/ActionListEditor';
import { AppSettingsEditor } from './common/AppSettingsEditor';
import { ModuleEditor } from './common/ModuleEditor';
import { PreviewModal } from './preview/PreviewModal';

type PanelMode = 'canvas' | 'palette' | 'properties' | 'screens' | 'theme' | 'state' | 'actions' | 'settings' | 'modules';

interface BuilderScreenProps {
  initialDefinition: AppDefinition;
  onSave: (definition: AppDefinition) => void;
  onBack: () => void;
}

export function BuilderScreen({ initialDefinition, onSave, onBack }: BuilderScreenProps) {
  const builder = useBuilderState(initialDefinition);
  const [panelMode, setPanelMode] = useState<PanelMode>('canvas');
  const [showPreview, setShowPreview] = useState(false);

  const handleAddComponent = (type: string) => {
    const parentId = builder.selectedComponent?.id ?? builder.currentScreen?.rootComponent.id;
    builder.addComponent(type, parentId ?? undefined);
    setPanelMode('canvas');
  };

  const handleSelectComponent = (id: string) => {
    builder.selection.select(id);
    if (id !== builder.currentScreen?.rootComponent.id) {
      setPanelMode('properties');
    }
  };

  const handleSave = () => {
    onSave(builder.appDef);
  };

  return (
    <View style={styles.container}>
      {/* Top toolbar */}
      <SafeAreaView style={styles.toolbar}>
        <TouchableOpacity onPress={onBack} style={styles.toolBtn}>
          <Text style={styles.toolBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.appName} numberOfLines={1}>{builder.appDef.app.displayName}</Text>
        <View style={styles.toolActions}>
          <TouchableOpacity onPress={builder.undo} style={styles.toolBtn}>
            <Text style={styles.toolBtnTextSmall}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={builder.redo} style={styles.toolBtn}>
            <Text style={styles.toolBtnTextSmall}>Redo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={[styles.toolBtn, styles.saveBtn]}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Screen tab bar */}
      <View style={styles.screenBar}>
        <Text style={styles.screenLabel}>
          Screen: {builder.currentScreen?.title ?? 'None'}
        </Text>
        <TouchableOpacity onPress={() => setShowPreview(true)} style={styles.previewBtn}>
          <Text style={styles.previewBtnText}>Preview</Text>
        </TouchableOpacity>
      </View>

      {/* Main content area */}
      <View style={styles.content}>
        {panelMode === 'canvas' && builder.currentScreen && (
          <ScreenCanvas
            rootComponent={builder.currentScreen.rootComponent}
            selectedId={builder.selection.selectedComponentId}
            onSelect={handleSelectComponent}
            onMoveUp={(id) => builder.moveComponent(id, 'up')}
            onMoveDown={(id) => builder.moveComponent(id, 'down')}
            onDelete={builder.deleteComponent}
          />
        )}
        {panelMode === 'palette' && (
          <ComponentPalette
            onSelect={handleAddComponent}
            onClose={() => setPanelMode('canvas')}
          />
        )}
        {panelMode === 'properties' && builder.selectedComponent && (
          <PropertyEditor
            component={builder.selectedComponent}
            onUpdateProps={builder.updateComponentProps}
            onUpdateStyle={builder.updateComponentStyle}
            onClose={() => { builder.selection.clearSelection(); setPanelMode('canvas'); }}
          />
        )}
        {panelMode === 'screens' && (
          <ScreenListPanel
            screens={builder.appDef.screens}
            selectedIndex={builder.selection.selectedScreenIndex}
            onSelectScreen={(i) => { builder.selection.selectScreen(i); setPanelMode('canvas'); }}
            onAddScreen={builder.addScreen}
            onDeleteScreen={builder.deleteScreen}
            onUpdateTitle={builder.updateScreenTitle}
            onClose={() => setPanelMode('canvas')}
          />
        )}
        {panelMode === 'theme' && (
          <View style={{ flex: 1 }}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelHeaderTitle}>Theme</Text>
              <TouchableOpacity onPress={() => setPanelMode('canvas')}>
                <Text style={styles.panelHeaderClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <ThemeEditor
              theme={builder.appDef.theme}
              onUpdateColors={builder.updateThemeColors}
            />
          </View>
        )}
        {panelMode === 'state' && (
          <StateEditor
            stateVars={builder.appDef.state}
            onAdd={builder.addStateVariable}
            onDelete={builder.deleteStateVariable}
            onClose={() => setPanelMode('canvas')}
          />
        )}
        {panelMode === 'actions' && (
          <ActionListEditor
            actions={builder.appDef.actions}
            onAdd={builder.addAction}
            onDelete={builder.deleteAction}
            onClose={() => setPanelMode('canvas')}
          />
        )}
        {panelMode === 'settings' && (
          <AppSettingsEditor
            appDef={builder.appDef}
            onUpdateMeta={builder.updateAppMeta}
            onUpdateNavType={builder.updateNavigationType}
            onClose={() => setPanelMode('canvas')}
          />
        )}
        {panelMode === 'modules' && (
          <ModuleEditor
            appDef={builder.appDef}
            onUpdateDef={builder.setAppDef}
            onClose={() => setPanelMode('canvas')}
          />
        )}
      </View>

      {/* Bottom tab bar */}
      <View style={styles.bottomBar}>
        <BottomTab label="Canvas" active={panelMode === 'canvas'} onPress={() => { builder.selection.clearSelection(); setPanelMode('canvas'); }} />
        <BottomTab label="+ Add" active={panelMode === 'palette'} onPress={() => setPanelMode('palette')} />
        <BottomTab label="Screens" active={panelMode === 'screens'} onPress={() => setPanelMode('screens')} />
        <BottomTab label="Data" active={panelMode === 'state'} onPress={() => setPanelMode('state')} />
        <BottomTab label="Actions" active={panelMode === 'actions'} onPress={() => setPanelMode('actions')} />
        <BottomTab label="Style" active={panelMode === 'theme'} onPress={() => setPanelMode('theme')} />
        <BottomTab label="Modules" active={panelMode === 'modules'} onPress={() => setPanelMode('modules')} />
        <BottomTab label="Settings" active={panelMode === 'settings'} onPress={() => setPanelMode('settings')} />
      </View>

      {/* Preview modal */}
      <Modal visible={showPreview} animationType="slide">
        <PreviewModal
          appDefinition={builder.appDef}
          onClose={() => setShowPreview(false)}
        />
      </Modal>
    </View>
  );
}

function BottomTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.bottomTab} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.bottomTabText, active && styles.bottomTabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  toolbar: {
    backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  toolBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  toolBtnText: { fontSize: 15, color: '#6366F1', fontWeight: '500' },
  toolBtnTextSmall: { fontSize: 13, color: '#6366F1', fontWeight: '500' },
  appName: { fontSize: 16, fontWeight: '600', color: '#1E293B', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  toolActions: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  saveBtn: { backgroundColor: '#6366F1', borderRadius: 6, paddingHorizontal: 14 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  screenBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F1F5F9',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  screenLabel: { fontSize: 13, color: '#475569', fontWeight: '500' },
  previewBtn: { paddingVertical: 4, paddingHorizontal: 12, backgroundColor: '#1E293B', borderRadius: 6 },
  previewBtnText: { fontSize: 12, color: '#F8FAFC', fontWeight: '600' },
  content: { flex: 1 },
  panelHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  panelHeaderTitle: { fontSize: 17, fontWeight: '600', color: '#1E293B' },
  panelHeaderClose: { fontSize: 15, color: '#6366F1', fontWeight: '500' },
  bottomBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingBottom: 20, paddingTop: 8,
  },
  bottomTab: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  bottomTabText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  bottomTabTextActive: { color: '#6366F1', fontWeight: '600' },
});

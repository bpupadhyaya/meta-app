import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { enableScreens } from 'react-native-screens';
import { ProjectListScreen } from './src/builder/ProjectListScreen';
import { BuilderScreen } from './src/builder/BuilderScreen';
import { PreviewModal } from './src/builder/preview/PreviewModal';
import { AppDefinition } from './src/schema/types';
import { ProjectDatabase } from './src/runtime/storage/ProjectDatabase';
import { registerBuiltinComponents } from './src/runtime/registry/builtins';

// Enable native screens for Android compatibility
enableScreens(true);

// Ensure components are registered
registerBuiltinComponents();

type AppMode = 'projects' | 'builder' | 'preview';

const projectDb = new ProjectDatabase();

export default function App() {
  const [mode, setMode] = useState<AppMode>('projects');
  const [currentApp, setCurrentApp] = useState<AppDefinition | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const handleOpenBuilder = (definition: AppDefinition, projectId: string) => {
    setCurrentApp(definition);
    setCurrentProjectId(projectId);
    setMode('builder');
  };

  const handlePreview = (definition: AppDefinition) => {
    setCurrentApp(definition);
    setPreviewKey((k) => k + 1);
    setMode('preview');
  };

  const handleSave = (definition: AppDefinition) => {
    if (currentProjectId) {
      projectDb.saveProject(currentProjectId, definition.app.displayName, definition);
    }
    setCurrentApp(definition);
  };

  const handleBackToProjects = () => {
    setMode('projects');
    setCurrentApp(null);
    setCurrentProjectId(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {mode === 'projects' && (
        <ProjectListScreen
          onOpenBuilder={handleOpenBuilder}
          onPreview={handlePreview}
        />
      )}
      {mode === 'builder' && currentApp && (
        <BuilderScreen
          initialDefinition={currentApp}
          onSave={handleSave}
          onBack={handleBackToProjects}
        />
      )}
      {mode === 'preview' && currentApp && (
        <PreviewModal
          key={`preview-${previewKey}`}
          appDefinition={currentApp}
          onClose={handleBackToProjects}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MetaAppRuntime } from './src/runtime/MetaAppRuntime';
import { templates, TemplateInfo } from './src/templates';
import { AppDefinition } from './src/schema/types';
import { validateAppDefinition } from './src/schema/validator';

type AppMode = 'launcher' | 'running';

export default function App() {
  const [mode, setMode] = useState<AppMode>('launcher');
  const [currentApp, setCurrentApp] = useState<AppDefinition | null>(null);

  const launchApp = (template: TemplateInfo) => {
    const validation = validateAppDefinition(template.template);
    if (!validation.valid) {
      console.warn('Invalid app definition:', validation.errors);
    }
    setCurrentApp(template.template);
    setMode('running');
  };

  if (mode === 'running' && currentApp) {
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={styles.runtimeHeader}>
          <TouchableOpacity onPress={() => setMode('launcher')} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Launcher</Text>
          </TouchableOpacity>
          <Text style={styles.appName}>{currentApp.app.displayName}</Text>
        </SafeAreaView>
        <View style={{ flex: 1 }}>
          <MetaAppRuntime appDefinition={currentApp} />
        </View>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>MetaApp</Text>
        <Text style={styles.subtitle}>Build apps without code</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Templates</Text>
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.templateCard}
              onPress={() => launchApp(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.templateName}>{item.name}</Text>
              <Text style={styles.templateDesc}>{item.description}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.templateList}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Select a template to preview the runtime engine</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  templateList: {
    gap: 12,
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  templateDesc: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  runtimeHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    color: '#6366F1',
    fontSize: 15,
    fontWeight: '500',
  },
  appName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
  },
});

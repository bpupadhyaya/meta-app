import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AppDefinition } from '../schema/types';
import { ModuleBridge, BridgeRegistry } from './ModuleBridge';
import { ModuleLifecycle } from './ModuleLifecycle';
import { ModuleLoader } from './ModuleLoader';
import { MetaAppRuntime } from '../runtime/MetaAppRuntime';
import { ErrorBoundary } from '../runtime/ErrorBoundary';

interface ModuleHostProps {
  moduleProjectId: string;
  inputProps?: Record<string, unknown>;
  onEvent?: (event: string, data: unknown) => void;
}

const lifecycle = new ModuleLifecycle();
const loader = new ModuleLoader();

export function ModuleHost({ moduleProjectId, inputProps, onEvent }: ModuleHostProps) {
  const [moduleDefinition, setModuleDefinition] = useState<AppDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bridge = useMemo(() => {
    const b = new ModuleBridge(moduleProjectId);
    BridgeRegistry.register(moduleProjectId, b);
    return b;
  }, [moduleProjectId]);

  useEffect(() => {
    lifecycle.create(moduleProjectId);
    lifecycle.setLoading(moduleProjectId);

    const loaded = loader.loadFromProject(moduleProjectId);
    if (!loaded) {
      setError('Module not found or has no module manifest');
      lifecycle.setError(moduleProjectId, 'Module not found');
      return;
    }

    // Apply input props to the module's initial state
    if (inputProps && loaded.manifest.inputProps) {
      for (const [key, value] of Object.entries(inputProps)) {
        if (key in loaded.manifest.inputProps && loaded.definition.state[key]) {
          loaded.definition.state[key] = {
            ...loaded.definition.state[key],
            defaultValue: value,
          };
        }
      }
    }

    setModuleDefinition(loaded.definition);
    lifecycle.mount(moduleProjectId);

    // Wire up output events to host callback
    const unsubscribes: Array<() => void> = [];
    if (onEvent && loaded.manifest.outputEvents) {
      for (const eventName of loaded.manifest.outputEvents) {
        const unsub = bridge.onHostEvent(eventName, (data) => {
          onEvent(eventName, data);
        });
        unsubscribes.push(unsub);
      }
    }

    return () => {
      unsubscribes.forEach((u) => u());
      lifecycle.unmount(moduleProjectId);
      BridgeRegistry.unregister(moduleProjectId);
    };
  }, [moduleProjectId, bridge, inputProps, onEvent]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Module Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!moduleDefinition) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6366F1" />
        <Text style={styles.loadingText}>Loading module...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary fallbackMessage="This embedded module encountered an error.">
      <View style={styles.container}>
        <MetaAppRuntime appDefinition={moduleDefinition} />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    padding: 24, alignItems: 'center', justifyContent: 'center',
  },
  loadingText: { fontSize: 13, color: '#64748B', marginTop: 8 },
  errorContainer: {
    padding: 16, backgroundColor: '#FEF2F2', borderRadius: 8, margin: 8,
  },
  errorTitle: { fontSize: 14, fontWeight: '600', color: '#991B1B' },
  errorMessage: { fontSize: 13, color: '#7F1D1D', marginTop: 4 },
});

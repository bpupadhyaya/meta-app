import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { AppDefinition } from '../schema/types';
import { ThemeProvider } from './styling/ThemeProvider';
import { RuntimeStateProvider, createRuntimeStore } from './state/RuntimeStateProvider';
import { NavigationRenderer } from './NavigationRenderer';
import { registerBuiltinComponents } from './registry/builtins';
import { StorageEngine } from './storage/StorageEngine';
import { ErrorBoundary } from './ErrorBoundary';

// Register built-in components on module load
registerBuiltinComponents();

interface MetaAppRuntimeProps {
  appDefinition: AppDefinition;
}

export function MetaAppRuntime({ appDefinition }: MetaAppRuntimeProps) {
  const [ready, setReady] = useState(false);

  const store = useMemo(
    () => createRuntimeStore(appDefinition.state),
    [appDefinition.state]
  );

  const storageEngine = useMemo(
    () => new StorageEngine(appDefinition),
    [appDefinition]
  );

  useEffect(() => {
    let mounted = true;

    async function init() {
      // Initialize SQLite tables
      await storageEngine.initialize(appDefinition);

      // Load persisted state from device storage
      const persisted = await storageEngine.loadPersistedState();
      const storeState = store.getState();
      for (const [key, value] of Object.entries(persisted)) {
        storeState.set(key, value);
      }

      if (mounted) setReady(true);
    }

    init();

    return () => {
      mounted = false;
      storageEngine.close();
    };
  }, [storageEngine, appDefinition, store]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 12, color: '#64748B' }}>Loading app...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary fallbackMessage="This app encountered an error. Go back and check your app definition.">
      <ThemeProvider theme={appDefinition.theme}>
        <RuntimeStateProvider store={store}>
          <NavigationRenderer
            navigation={appDefinition.navigation}
            screens={appDefinition.screens}
            actions={appDefinition.actions}
            storage={storageEngine}
          />
        </RuntimeStateProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

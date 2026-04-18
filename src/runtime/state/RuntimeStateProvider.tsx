import React, { createContext, useContext, useRef } from 'react';
import { create, StoreApi, useStore } from 'zustand';
import { StateVariable } from '../../schema/types';

export interface RuntimeState {
  values: Record<string, unknown>;
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  getNestedValue: (path: string) => unknown;
  setNestedValue: (path: string, value: unknown) => void;
}

export function createRuntimeStore(stateDefinitions: Record<string, StateVariable>): StoreApi<RuntimeState> {
  const initialValues: Record<string, unknown> = {};
  for (const [key, def] of Object.entries(stateDefinitions)) {
    initialValues[key] = def.defaultValue;
  }

  return create<RuntimeState>((set, get) => ({
    values: initialValues,
    get: (key: string) => get().values[key],
    set: (key: string, value: unknown) => {
      set((state) => ({
        values: { ...state.values, [key]: value },
      }));
    },
    getNestedValue: (path: string) => {
      const parts = path.split('.');
      let current: unknown = get().values;
      for (const part of parts) {
        if (current != null && typeof current === 'object') {
          current = (current as Record<string, unknown>)[part];
        } else {
          return undefined;
        }
      }
      return current;
    },
    setNestedValue: (path: string, value: unknown) => {
      const parts = path.split('.');
      if (parts.length === 1) {
        get().set(parts[0], value);
        return;
      }
      const rootKey = parts[0];
      const rootVal = get().values[rootKey];
      const newRoot = deepSet(rootVal, parts.slice(1), value);
      get().set(rootKey, newRoot);
    },
  }));
}

function deepSet(obj: unknown, path: string[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const target = (obj != null && typeof obj === 'object') ? { ...(obj as Record<string, unknown>) } : {};
  target[head] = deepSet(target[head], rest, value);
  return target;
}

const RuntimeStateContext = createContext<StoreApi<RuntimeState> | null>(null);

interface RuntimeStateProviderProps {
  store: StoreApi<RuntimeState>;
  children: React.ReactNode;
}

export function RuntimeStateProvider({ store, children }: RuntimeStateProviderProps) {
  return (
    <RuntimeStateContext.Provider value={store}>
      {children}
    </RuntimeStateContext.Provider>
  );
}

export function useRuntimeState(): RuntimeState {
  const store = useContext(RuntimeStateContext);
  if (!store) throw new Error('useRuntimeState must be used within RuntimeStateProvider');
  return useStore(store);
}

export function useRuntimeStateValue(key: string): unknown {
  const state = useRuntimeState();
  return state.values[key];
}

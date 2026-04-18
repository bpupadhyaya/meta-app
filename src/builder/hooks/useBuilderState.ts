import { useState, useCallback, useMemo } from 'react';
import { AppDefinition, ComponentNode, ScreenDefinition, StyleDefinition, ThemeDefinition, ActionDefinition, StateVariable, StorageDefinition, TableDefinition } from '../../schema/types';
import { useUndoRedo } from './useUndoRedo';
import { useSelection } from './useSelection';
import { generateId, generateComponentId } from '../../utils/idGenerator';
import { ComponentRegistry } from '../../runtime/registry/ComponentRegistry';

export function useBuilderState(initialDefinition: AppDefinition) {
  const [appDef, setAppDef] = useState<AppDefinition>(initialDefinition);
  const undoRedo = useUndoRedo();
  const selection = useSelection();

  const updateDef = useCallback((newDef: AppDefinition) => {
    undoRedo.pushState(appDef);
    const updated = { ...newDef, app: { ...newDef.app, updatedAt: new Date().toISOString() } };
    setAppDef(updated);
  }, [appDef, undoRedo]);

  const undo = useCallback(() => {
    const prev = undoRedo.undo();
    if (prev) setAppDef(prev);
  }, [undoRedo]);

  const redo = useCallback(() => {
    const next = undoRedo.redo();
    if (next) setAppDef(next);
  }, [undoRedo]);

  // ---- Screen operations ----

  const currentScreen: ScreenDefinition | undefined = appDef.screens[selection.selectedScreenIndex];

  const addScreen = useCallback((name: string, title: string) => {
    const screen: ScreenDefinition = {
      id: generateId(),
      name: name.toLowerCase().replace(/\s+/g, '-'),
      title,
      scrollable: true,
      rootComponent: {
        id: generateId(),
        type: 'view',
        props: {},
        style: { layout: { flex: 1, flexDirection: 'column' }, spacing: { padding: 16 } },
        children: [],
      },
    };
    const newDef = {
      ...appDef,
      screens: [...appDef.screens, screen],
      navigation: {
        ...appDef.navigation,
        items: [...appDef.navigation.items, { screen: screen.name, label: title }],
      },
    };
    updateDef(newDef);
    selection.selectScreen(appDef.screens.length);
  }, [appDef, updateDef, selection]);

  const deleteScreen = useCallback((index: number) => {
    if (appDef.screens.length <= 1) return;
    const screenName = appDef.screens[index].name;
    const newScreens = appDef.screens.filter((_, i) => i !== index);
    const newDef = {
      ...appDef,
      screens: newScreens,
      navigation: {
        ...appDef.navigation,
        initialScreen: appDef.navigation.initialScreen === screenName
          ? newScreens[0].name
          : appDef.navigation.initialScreen,
        items: appDef.navigation.items.filter((item) => item.screen !== screenName),
      },
    };
    updateDef(newDef);
    if (selection.selectedScreenIndex >= newScreens.length) {
      selection.selectScreen(newScreens.length - 1);
    }
  }, [appDef, updateDef, selection]);

  const updateScreenTitle = useCallback((index: number, title: string) => {
    const newScreens = [...appDef.screens];
    const oldName = newScreens[index].name;
    newScreens[index] = { ...newScreens[index], title };
    const newDef = {
      ...appDef,
      screens: newScreens,
      navigation: {
        ...appDef.navigation,
        items: appDef.navigation.items.map((item) =>
          item.screen === oldName ? { ...item, label: title } : item
        ),
      },
    };
    updateDef(newDef);
  }, [appDef, updateDef]);

  // ---- Component operations ----

  const addComponent = useCallback((type: string, parentId?: string) => {
    const registration = ComponentRegistry.get(type);
    if (!registration) return;

    const newNode: ComponentNode = {
      id: generateComponentId(type),
      type,
      props: { ...registration.defaultProps } as Record<string, import('../../schema/types').PropValue>,
      children: registration.acceptsChildren ? [] : undefined,
    };

    const screenIndex = selection.selectedScreenIndex;
    const targetParentId = parentId ?? currentScreen?.rootComponent.id;
    if (!targetParentId) return;

    const newScreens = [...appDef.screens];
    newScreens[screenIndex] = {
      ...newScreens[screenIndex],
      rootComponent: insertNode(newScreens[screenIndex].rootComponent, targetParentId, newNode),
    };
    updateDef({ ...appDef, screens: newScreens });
    selection.select(newNode.id);
  }, [appDef, updateDef, selection, currentScreen]);

  const deleteComponent = useCallback((componentId: string) => {
    const screenIndex = selection.selectedScreenIndex;
    if (componentId === appDef.screens[screenIndex].rootComponent.id) return;

    const newScreens = [...appDef.screens];
    newScreens[screenIndex] = {
      ...newScreens[screenIndex],
      rootComponent: removeNode(newScreens[screenIndex].rootComponent, componentId),
    };
    updateDef({ ...appDef, screens: newScreens });
    if (selection.selectedComponentId === componentId) {
      selection.clearSelection();
    }
  }, [appDef, updateDef, selection]);

  const updateComponentProps = useCallback((componentId: string, props: Record<string, unknown>) => {
    const screenIndex = selection.selectedScreenIndex;
    const newScreens = [...appDef.screens];
    newScreens[screenIndex] = {
      ...newScreens[screenIndex],
      rootComponent: updateNode(newScreens[screenIndex].rootComponent, componentId, (node) => ({
        ...node,
        props: { ...node.props, ...props } as Record<string, import('../../schema/types').PropValue>,
      })),
    };
    updateDef({ ...appDef, screens: newScreens });
  }, [appDef, updateDef, selection]);

  const updateComponentStyle = useCallback((componentId: string, style: StyleDefinition) => {
    const screenIndex = selection.selectedScreenIndex;
    const newScreens = [...appDef.screens];
    newScreens[screenIndex] = {
      ...newScreens[screenIndex],
      rootComponent: updateNode(newScreens[screenIndex].rootComponent, componentId, (node) => ({
        ...node,
        style: { ...node.style, ...style },
      })),
    };
    updateDef({ ...appDef, screens: newScreens });
  }, [appDef, updateDef, selection]);

  const moveComponent = useCallback((componentId: string, direction: 'up' | 'down') => {
    const screenIndex = selection.selectedScreenIndex;
    const newScreens = [...appDef.screens];
    newScreens[screenIndex] = {
      ...newScreens[screenIndex],
      rootComponent: moveNode(newScreens[screenIndex].rootComponent, componentId, direction),
    };
    updateDef({ ...appDef, screens: newScreens });
  }, [appDef, updateDef, selection]);

  // ---- Theme ----

  const updateTheme = useCallback((theme: Partial<ThemeDefinition>) => {
    updateDef({
      ...appDef,
      theme: { ...appDef.theme, ...theme } as ThemeDefinition,
    });
  }, [appDef, updateDef]);

  const updateThemeColors = useCallback((colors: Record<string, string>) => {
    updateDef({
      ...appDef,
      theme: { ...appDef.theme, colors: { ...appDef.theme.colors, ...colors } },
    });
  }, [appDef, updateDef]);

  // ---- Navigation ----

  const updateNavigationType = useCallback((type: 'stack' | 'tabs') => {
    updateDef({
      ...appDef,
      navigation: { ...appDef.navigation, type },
    });
  }, [appDef, updateDef]);

  // ---- State variables ----

  const addStateVariable = useCallback((name: string, variable: StateVariable) => {
    updateDef({
      ...appDef,
      state: { ...appDef.state, [name]: variable },
    });
  }, [appDef, updateDef]);

  const deleteStateVariable = useCallback((name: string) => {
    const newState = { ...appDef.state };
    delete newState[name];
    updateDef({ ...appDef, state: newState });
  }, [appDef, updateDef]);

  // ---- Actions ----

  const addAction = useCallback((action: ActionDefinition) => {
    updateDef({
      ...appDef,
      actions: { ...appDef.actions, [action.id]: action },
    });
  }, [appDef, updateDef]);

  const deleteAction = useCallback((actionId: string) => {
    const newActions = { ...appDef.actions };
    delete newActions[actionId];
    updateDef({ ...appDef, actions: newActions });
  }, [appDef, updateDef]);

  // ---- Storage / Tables ----

  const addTable = useCallback((name: string, table: TableDefinition) => {
    const storage: StorageDefinition = appDef.storage ?? { tables: {} };
    updateDef({
      ...appDef,
      storage: { ...storage, tables: { ...storage.tables, [name]: table } },
    });
  }, [appDef, updateDef]);

  const deleteTable = useCallback((name: string) => {
    if (!appDef.storage) return;
    const newTables = { ...appDef.storage.tables };
    delete newTables[name];
    updateDef({
      ...appDef,
      storage: { ...appDef.storage, tables: newTables },
    });
  }, [appDef, updateDef]);

  // ---- App metadata ----

  const updateAppMeta = useCallback((meta: Partial<AppDefinition['app']>) => {
    updateDef({
      ...appDef,
      app: { ...appDef.app, ...meta },
    });
  }, [appDef, updateDef]);

  // ---- Find component ----

  const findComponent = useCallback((componentId: string): ComponentNode | null => {
    if (!currentScreen) return null;
    return findNode(currentScreen.rootComponent, componentId);
  }, [currentScreen]);

  const selectedComponent = useMemo(() => {
    if (!selection.selectedComponentId) return null;
    return findComponent(selection.selectedComponentId);
  }, [selection.selectedComponentId, findComponent]);

  return {
    appDef,
    setAppDef: updateDef,
    undo,
    redo,
    canUndo: undoRedo.canUndo,
    canRedo: undoRedo.canRedo,
    selection,
    currentScreen,
    selectedComponent,
    findComponent,
    // Screen ops
    addScreen,
    deleteScreen,
    updateScreenTitle,
    // Component ops
    addComponent,
    deleteComponent,
    updateComponentProps,
    updateComponentStyle,
    moveComponent,
    // Theme
    updateTheme,
    updateThemeColors,
    // Navigation
    updateNavigationType,
    // State
    addStateVariable,
    deleteStateVariable,
    // Actions
    addAction,
    deleteAction,
    // Storage
    addTable,
    deleteTable,
    // Meta
    updateAppMeta,
  };
}

// ---- Tree helpers ----

function findNode(root: ComponentNode, id: string): ComponentNode | null {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

function insertNode(root: ComponentNode, parentId: string, newNode: ComponentNode): ComponentNode {
  if (root.id === parentId) {
    return { ...root, children: [...(root.children ?? []), newNode] };
  }
  if (root.children) {
    return { ...root, children: root.children.map((c) => insertNode(c, parentId, newNode)) };
  }
  return root;
}

function removeNode(root: ComponentNode, id: string): ComponentNode {
  if (root.children) {
    return {
      ...root,
      children: root.children
        .filter((c) => c.id !== id)
        .map((c) => removeNode(c, id)),
    };
  }
  return root;
}

function updateNode(root: ComponentNode, id: string, updater: (node: ComponentNode) => ComponentNode): ComponentNode {
  if (root.id === id) return updater(root);
  if (root.children) {
    return { ...root, children: root.children.map((c) => updateNode(c, id, updater)) };
  }
  return root;
}

function moveNode(root: ComponentNode, id: string, direction: 'up' | 'down'): ComponentNode {
  if (root.children) {
    const index = root.children.findIndex((c) => c.id === id);
    if (index !== -1) {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex >= 0 && newIndex < root.children.length) {
        const newChildren = [...root.children];
        [newChildren[index], newChildren[newIndex]] = [newChildren[newIndex], newChildren[index]];
        return { ...root, children: newChildren };
      }
    }
    return { ...root, children: root.children.map((c) => moveNode(c, id, direction)) };
  }
  return root;
}

export type BuilderStateReturn = ReturnType<typeof useBuilderState>;

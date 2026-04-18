import { ThemeDefinition, AppDefinition, ScreenDefinition, ComponentNode } from './types';
import { generateId } from '../utils/idGenerator';

export const defaultTheme: ThemeDefinition = {
  colors: {
    primary: '#6366F1',
    secondary: '#EC4899',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    error: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
  },
  typography: {
    fontFamily: 'System',
    sizes: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32 },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 4, md: 8, lg: 16, full: 9999 },
};

export function createDefaultScreen(name: string, title: string): ScreenDefinition {
  return {
    id: generateId(),
    name,
    title,
    scrollable: true,
    rootComponent: {
      id: generateId(),
      type: 'view',
      props: {},
      style: {
        layout: { flex: 1, flexDirection: 'column' },
        spacing: { padding: 16 },
        appearance: { backgroundColor: '$colors.background' },
      },
      children: [],
    },
  };
}

export function createDefaultApp(name: string): AppDefinition {
  const now = new Date().toISOString();
  return {
    $schema: 'metaapp://schema/v1',
    version: '1.0.0',
    app: {
      id: generateId(),
      name,
      displayName: name,
      version: '1.0.0',
      description: '',
      icon: 'app-outline',
      author: '',
      createdAt: now,
      updatedAt: now,
    },
    theme: defaultTheme,
    dataModels: {},
    dataSources: {},
    state: {},
    screens: [createDefaultScreen('home', 'Home')],
    navigation: {
      type: 'stack',
      initialScreen: 'home',
      items: [{ screen: 'home', label: 'Home' }],
    },
    actions: {},
  };
}

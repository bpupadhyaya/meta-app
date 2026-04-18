import { AppDefinition } from '../schema/types';

export const blankTemplate: AppDefinition = {
  $schema: 'metaapp://schema/v1',
  version: '1.0.0',
  app: {
    id: 'template-blank',
    name: 'blank-app',
    displayName: 'New App',
    version: '1.0.0',
    description: 'A blank app to start from scratch',
    icon: 'app-outline',
    author: 'MetaApp',
    createdAt: '2026-04-17T00:00:00Z',
    updatedAt: '2026-04-17T00:00:00Z',
  },
  theme: {
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
  },
  dataModels: {},
  dataSources: {},
  state: {},
  screens: [
    {
      id: 'screen-home',
      name: 'home',
      title: 'Home',
      scrollable: true,
      rootComponent: {
        id: 'root-view',
        type: 'view',
        props: {},
        style: {
          layout: { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
          spacing: { padding: 16 },
        },
        children: [
          {
            id: 'welcome-text',
            type: 'text',
            props: { text: 'Welcome to your new app!', variant: 'heading' },
          },
          {
            id: 'spacer-1',
            type: 'spacer',
            props: { size: 8 },
          },
          {
            id: 'subtitle-text',
            type: 'text',
            props: { text: 'Start building by adding components.', variant: 'caption' },
          },
        ],
      },
    },
  ],
  navigation: {
    type: 'stack',
    initialScreen: 'home',
    items: [{ screen: 'home', label: 'Home' }],
  },
  actions: {},
};

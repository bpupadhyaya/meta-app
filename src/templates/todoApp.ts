import { AppDefinition } from '../schema/types';

export const todoAppTemplate: AppDefinition = {
  $schema: 'metaapp://schema/v1',
  version: '1.0.0',
  app: {
    id: 'template-todo-app',
    name: 'todo-app',
    displayName: 'My Todo App',
    version: '1.0.0',
    description: 'A simple todo list application',
    icon: 'checkbox-outline',
    author: 'MetaApp Templates',
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
  dataModels: {
    Todo: {
      name: 'Todo',
      fields: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true },
        completed: { type: 'boolean', defaultValue: false },
      },
    },
  },
  dataSources: {},
  state: {
    todos: { type: 'array', defaultValue: [], persist: true },
    newTodoText: { type: 'string', defaultValue: '' },
  },
  screens: [
    {
      id: 'screen-main',
      name: 'main',
      title: 'My Todos',
      scrollable: false,
      rootComponent: {
        id: 'root-view',
        type: 'view',
        props: {},
        style: {
          layout: { flex: 1, flexDirection: 'column' },
          spacing: { padding: '$spacing.md' },
          appearance: { backgroundColor: '$colors.background' },
        },
        children: [
          {
            id: 'header-text',
            type: 'text',
            props: { text: 'My Todos', variant: 'heading' },
            style: {
              spacing: { marginBottom: '$spacing.lg' },
            },
          },
          {
            id: 'input-row',
            type: 'view',
            props: {},
            style: {
              layout: { flexDirection: 'row', alignItems: 'center' },
              spacing: { marginBottom: '$spacing.md' },
            },
            children: [
              {
                id: 'todo-input',
                type: 'input',
                props: {
                  placeholder: 'What needs to be done?',
                  value: { $bind: 'state.newTodoText' },
                },
                style: {
                  layout: { flex: 1 },
                  spacing: { marginRight: '$spacing.sm' },
                },
                events: {
                  onChange: [
                    {
                      inline: [
                        {
                          type: 'setState' as const,
                          key: 'newTodoText',
                          value: { $bind: 'event.value' },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                id: 'add-button',
                type: 'button',
                props: { title: 'Add', variant: 'primary' },
                events: {
                  onPress: ['addTodo'],
                },
              },
            ],
          },
          {
            id: 'todo-list-container',
            type: 'scrollview',
            props: {},
            style: {
              layout: { flex: 1 },
            },
            children: [
              {
                id: 'todo-item-repeat',
                type: 'view',
                props: {},
                repeat: { $each: 'state.todos', as: 'item', keyPath: 'id' },
                style: {
                  layout: { flexDirection: 'row', alignItems: 'center' },
                  spacing: { padding: '$spacing.md', marginBottom: '$spacing.xs' },
                  appearance: {
                    backgroundColor: '$colors.surface',
                    borderRadius: '$borderRadius.md',
                  },
                },
                children: [
                  {
                    id: 'todo-checkbox',
                    type: 'checkbox',
                    props: {
                      checked: { $bind: 'item.completed' },
                    },
                    events: {
                      onChange: [
                        {
                          inline: [
                            {
                              type: 'setState' as const,
                              key: 'todos',
                              value: { $bind: 'state.todos' }, // Will be handled by toggle logic
                            },
                          ],
                        },
                      ],
                    },
                  },
                  {
                    id: 'todo-title',
                    type: 'text',
                    props: {
                      text: { $bind: 'item.title' },
                    },
                    style: {
                      layout: { flex: 1 },
                      spacing: { marginLeft: '$spacing.sm' },
                    },
                  },
                  {
                    id: 'todo-delete',
                    type: 'button',
                    props: { title: 'X', variant: 'ghost' },
                    events: {
                      onPress: [
                        {
                          inline: [
                            {
                              type: 'alert' as const,
                              title: 'Delete',
                              message: 'Delete this todo?',
                              buttons: [
                                { text: 'Cancel' },
                                {
                                  text: 'Delete',
                                  actions: [
                                    {
                                      type: 'setState' as const,
                                      key: 'todos',
                                      value: { $bind: 'state.todos' }, // Will filter in future
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
          {
            id: 'empty-state',
            type: 'view',
            props: {},
            conditional: { $if: 'len(state.todos) == 0' },
            style: {
              layout: { flex: 1, alignItems: 'center', justifyContent: 'center' },
              spacing: { padding: '$spacing.xl' },
            },
            children: [
              {
                id: 'empty-text',
                type: 'text',
                props: { text: 'No todos yet. Add one above!', variant: 'caption' },
              },
            ],
          },
        ],
      },
    },
  ],
  navigation: {
    type: 'stack',
    initialScreen: 'main',
    items: [{ screen: 'main', label: 'My Todos' }],
  },
  actions: {
    addTodo: {
      id: 'addTodo',
      name: 'Add Todo',
      steps: [
        {
          type: 'conditional',
          condition: 'len(state.newTodoText) > 0',
          then: [
            {
              type: 'setState',
              key: 'newTodoText',
              value: '',
            },
          ],
        },
      ],
    },
  },
};

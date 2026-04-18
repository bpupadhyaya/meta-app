import React from 'react';
import { View, ScrollView } from 'react-native';
import { ScreenDefinition, ActionDefinition } from '../schema/types';
import { ComponentRenderer } from './ComponentRenderer';
import { useTheme } from './styling/ThemeProvider';
import { ExecutionContext } from './actions/ActionExecutor';
import { StorageEngine } from './storage/StorageEngine';

interface ScreenRendererProps {
  screen: ScreenDefinition;
  actions: Record<string, ActionDefinition>;
  storage?: StorageEngine;
  navigation?: ExecutionContext['navigation'];
}

export function ScreenRenderer({ screen, actions, storage, navigation }: ScreenRendererProps) {
  const theme = useTheme();
  const bgColor = screen.backgroundColor
    ? (screen.backgroundColor.startsWith('$')
        ? resolveThemeColor(screen.backgroundColor, theme)
        : screen.backgroundColor)
    : theme.colors.background;

  const content = (
    <ComponentRenderer
      node={screen.rootComponent}
      actions={actions}
      storage={storage}
      navigation={navigation}
    />
  );

  if (screen.scrollable) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {content}
    </View>
  );
}

function resolveThemeColor(token: string, theme: any): string {
  const path = token.slice(1).split('.');
  let current: any = theme;
  for (const part of path) {
    current = current?.[part];
  }
  return typeof current === 'string' ? current : '#FFFFFF';
}

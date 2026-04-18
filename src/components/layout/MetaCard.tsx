import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../runtime/styling/ThemeProvider';

interface MetaCardProps {
  elevation?: number;
  style?: Record<string, unknown>;
  children?: React.ReactNode;
}

export function MetaCard({ elevation = 2, style, children }: MetaCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: elevation },
          shadowOpacity: 0.1,
          shadowRadius: elevation * 2,
          elevation,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

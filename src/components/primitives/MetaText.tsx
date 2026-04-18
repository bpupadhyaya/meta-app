import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../runtime/styling/ThemeProvider';

interface MetaTextProps {
  text?: string;
  variant?: 'body' | 'heading' | 'caption' | 'label';
  style?: Record<string, unknown>;
  children?: React.ReactNode;
}

export function MetaText({ text, variant = 'body', style, children }: MetaTextProps) {
  const theme = useTheme();

  const variantStyles = {
    body: { fontSize: theme.typography.sizes.md, color: theme.colors.text },
    heading: { fontSize: theme.typography.sizes.xl, color: theme.colors.text, fontWeight: 'bold' as const },
    caption: { fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary },
    label: { fontSize: theme.typography.sizes.sm, color: theme.colors.text, fontWeight: '600' as const },
  };

  return (
    <Text style={[variantStyles[variant], style]}>
      {text ?? children}
    </Text>
  );
}

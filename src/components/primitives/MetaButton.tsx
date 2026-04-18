import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../runtime/styling/ThemeProvider';

interface MetaButtonProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  onPress?: () => void;
  style?: Record<string, unknown>;
}

export function MetaButton({ title = 'Button', variant = 'primary', disabled, onPress, style }: MetaButtonProps) {
  const theme = useTheme();

  const baseStyle = {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const variantStyles: Record<string, Record<string, unknown>> = {
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColors: Record<string, string> = {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
  };

  return (
    <TouchableOpacity
      style={[baseStyle, variantStyles[variant], disabled && { opacity: 0.5 }, style]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      activeOpacity={0.7}
    >
      <Text style={{ color: textColors[variant], fontSize: theme.typography.sizes.md, fontWeight: '600' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

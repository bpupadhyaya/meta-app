import React from 'react';
import { TextInput } from 'react-native';
import { useTheme } from '../../runtime/styling/ThemeProvider';

interface MetaInputProps {
  value?: string;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  onChange?: (value: string) => void;
  style?: Record<string, unknown>;
}

export function MetaInput({
  value,
  placeholder,
  multiline,
  secureTextEntry,
  keyboardType = 'default',
  onChange,
  style,
}: MetaInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      value={value}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
      multiline={multiline}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      onChangeText={onChange}
      style={[
        {
          borderWidth: 1,
          borderColor: theme.colors.textSecondary,
          borderRadius: theme.borderRadius.md,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          fontSize: theme.typography.sizes.md,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
          minHeight: multiline ? 80 : undefined,
        },
        style,
      ]}
    />
  );
}

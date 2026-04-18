import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTheme } from '../../runtime/styling/ThemeProvider';

interface MetaCheckboxProps {
  checked?: boolean;
  label?: string;
  onChange?: (value: boolean) => void;
  style?: Record<string, unknown>;
}

export function MetaCheckbox({ checked = false, label, onChange, style }: MetaCheckboxProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[{ flexDirection: 'row', alignItems: 'center' }, style]}
      onPress={() => onChange?.(!checked)}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: theme.borderRadius.sm,
          borderWidth: 2,
          borderColor: checked ? theme.colors.primary : theme.colors.textSecondary,
          backgroundColor: checked ? theme.colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
        )}
      </View>
      {label && (
        <Text style={{ marginLeft: theme.spacing.sm, fontSize: theme.typography.sizes.md, color: theme.colors.text }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

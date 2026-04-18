import React from 'react';
import { Switch, View, Text } from 'react-native';
import { useTheme } from '../../runtime/styling/ThemeProvider';

interface MetaSwitchProps {
  value?: boolean;
  label?: string;
  onChange?: (value: boolean) => void;
  style?: Record<string, unknown>;
}

export function MetaSwitch({ value = false, label, onChange, style }: MetaSwitchProps) {
  const theme = useTheme();

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {label && (
        <Text style={{ fontSize: theme.typography.sizes.md, color: theme.colors.text, marginRight: theme.spacing.sm }}>
          {label}
        </Text>
      )}
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

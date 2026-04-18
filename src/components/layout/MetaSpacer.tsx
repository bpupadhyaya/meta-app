import React from 'react';
import { View } from 'react-native';

interface MetaSpacerProps {
  size?: number;
  horizontal?: boolean;
  style?: Record<string, unknown>;
}

export function MetaSpacer({ size = 16, horizontal, style }: MetaSpacerProps) {
  return (
    <View
      style={[
        horizontal ? { width: size } : { height: size },
        style,
      ]}
    />
  );
}

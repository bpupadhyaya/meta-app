import React from 'react';
import { View } from 'react-native';

interface MetaViewProps {
  style?: Record<string, unknown>;
  children?: React.ReactNode;
}

export function MetaView({ style, children }: MetaViewProps) {
  return <View style={style}>{children}</View>;
}

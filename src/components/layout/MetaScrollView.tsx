import React from 'react';
import { ScrollView } from 'react-native';

interface MetaScrollViewProps {
  horizontal?: boolean;
  style?: Record<string, unknown>;
  children?: React.ReactNode;
}

export function MetaScrollView({ horizontal, style, children }: MetaScrollViewProps) {
  return (
    <ScrollView
      horizontal={horizontal}
      style={style}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

import React from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '../../runtime/styling/ThemeProvider';

interface MetaImageProps {
  source?: string;
  width?: number;
  height?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  borderRadius?: number;
  style?: Record<string, unknown>;
}

export function MetaImage({ source, width = 100, height = 100, resizeMode = 'cover', borderRadius, style }: MetaImageProps) {
  const theme = useTheme();

  if (!source) {
    return (
      <View
        style={[
          {
            width,
            height,
            backgroundColor: theme.colors.surface,
            borderRadius: borderRadius ?? theme.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      />
    );
  }

  return (
    <Image
      source={{ uri: source }}
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? theme.borderRadius.md,
        },
        style,
      ]}
      resizeMode={resizeMode}
    />
  );
}

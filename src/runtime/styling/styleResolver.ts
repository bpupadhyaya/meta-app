import { StyleDefinition, ThemeDefinition } from '../../schema/types';
import { ViewStyle, TextStyle } from 'react-native';

type FlatStyle = ViewStyle & TextStyle;

export function resolveStyles(
  styleDef: StyleDefinition | undefined,
  theme: ThemeDefinition
): FlatStyle {
  if (!styleDef) return {};

  const resolved: FlatStyle = {};

  if (styleDef.layout) {
    Object.assign(resolved, styleDef.layout);
  }

  if (styleDef.spacing) {
    const spacing = styleDef.spacing;
    for (const [key, val] of Object.entries(spacing)) {
      if (val !== undefined) {
        (resolved as Record<string, unknown>)[key] = resolveToken(val, theme);
      }
    }
  }

  if (styleDef.size) {
    for (const [key, val] of Object.entries(styleDef.size)) {
      if (val !== undefined) {
        (resolved as Record<string, unknown>)[key] = resolveToken(val, theme);
      }
    }
  }

  if (styleDef.appearance) {
    for (const [key, val] of Object.entries(styleDef.appearance)) {
      if (val !== undefined) {
        (resolved as Record<string, unknown>)[key] = resolveToken(val, theme);
      }
    }
  }

  if (styleDef.text) {
    for (const [key, val] of Object.entries(styleDef.text)) {
      if (val !== undefined) {
        (resolved as Record<string, unknown>)[key] = resolveToken(val, theme);
      }
    }
  }

  return resolved;
}

function resolveToken(
  value: string | number | undefined,
  theme: ThemeDefinition
): string | number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return value;

  if (!value.startsWith('$')) return value;

  const path = value.slice(1); // Remove leading $
  const parts = path.split('.');

  let current: unknown = theme;
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return value; // Can't resolve, return as-is
    }
  }

  if (typeof current === 'string' || typeof current === 'number') {
    return current;
  }

  return value;
}

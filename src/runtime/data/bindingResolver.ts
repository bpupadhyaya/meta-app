import { PropValue, PropBinding } from '../../schema/types';
import { evaluateExpression, resolveTemplateString } from '../state/expressionEvaluator';

export type Scope = Record<string, unknown>;

export function isBinding(value: unknown): value is PropBinding {
  return value != null && typeof value === 'object' && '$bind' in value;
}

export function resolveBindings(
  props: Record<string, PropValue>,
  scope: Scope
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    resolved[key] = resolvePropValue(value, scope);
  }

  return resolved;
}

export function resolvePropValue(value: PropValue, scope: Scope): unknown {
  if (value === null || value === undefined) return value;

  if (isBinding(value)) {
    return resolveBinding(value, scope);
  }

  if (typeof value === 'string' && value.includes('{{')) {
    return resolveTemplateString(value, scope);
  }

  if (Array.isArray(value)) {
    return value.map((v) => resolvePropValue(v, scope));
  }

  return value;
}

function resolveBinding(binding: PropBinding, scope: Scope): unknown {
  const result = evaluateExpression(binding.$bind, scope);

  if (binding.transform) {
    return applyTransform(result, binding.transform);
  }

  return result;
}

function applyTransform(value: unknown, transform: string): unknown {
  switch (transform) {
    case 'uppercase':
      return typeof value === 'string' ? value.toUpperCase() : value;
    case 'lowercase':
      return typeof value === 'string' ? value.toLowerCase() : value;
    case 'trim':
      return typeof value === 'string' ? value.trim() : value;
    case 'toString':
      return String(value ?? '');
    case 'toNumber':
      return Number(value) || 0;
    case 'toBoolean':
      return Boolean(value);
    default:
      return value;
  }
}

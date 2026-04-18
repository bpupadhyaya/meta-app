import { AppDefinition } from './types';

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateAppDefinition(def: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!def || typeof def !== 'object') {
    return { valid: false, errors: [{ path: '/', message: 'App definition must be an object' }] };
  }

  const app = def as Record<string, unknown>;

  if (!app.$schema || typeof app.$schema !== 'string') {
    errors.push({ path: '/$schema', message: '$schema is required and must be a string' });
  }
  if (!app.version || typeof app.version !== 'string') {
    errors.push({ path: '/version', message: 'version is required and must be a string' });
  }
  if (!app.app || typeof app.app !== 'object') {
    errors.push({ path: '/app', message: 'app metadata is required' });
  } else {
    const meta = app.app as Record<string, unknown>;
    if (!meta.id) errors.push({ path: '/app/id', message: 'app.id is required' });
    if (!meta.name) errors.push({ path: '/app/name', message: 'app.name is required' });
    if (!meta.displayName) errors.push({ path: '/app/displayName', message: 'app.displayName is required' });
  }
  if (!app.theme || typeof app.theme !== 'object') {
    errors.push({ path: '/theme', message: 'theme is required' });
  }
  if (!Array.isArray(app.screens)) {
    errors.push({ path: '/screens', message: 'screens must be an array' });
  } else {
    (app.screens as unknown[]).forEach((screen, i) => {
      if (!screen || typeof screen !== 'object') {
        errors.push({ path: `/screens/${i}`, message: 'screen must be an object' });
        return;
      }
      const s = screen as Record<string, unknown>;
      if (!s.id) errors.push({ path: `/screens/${i}/id`, message: 'screen.id is required' });
      if (!s.name) errors.push({ path: `/screens/${i}/name`, message: 'screen.name is required' });
      if (!s.rootComponent) errors.push({ path: `/screens/${i}/rootComponent`, message: 'screen.rootComponent is required' });
      else {
        validateComponentNode(s.rootComponent, `/screens/${i}/rootComponent`, errors);
      }
    });
  }
  if (!app.navigation || typeof app.navigation !== 'object') {
    errors.push({ path: '/navigation', message: 'navigation is required' });
  }

  return { valid: errors.length === 0, errors };
}

function validateComponentNode(node: unknown, path: string, errors: ValidationError[]): void {
  if (!node || typeof node !== 'object') {
    errors.push({ path, message: 'component node must be an object' });
    return;
  }
  const n = node as Record<string, unknown>;
  if (!n.id) errors.push({ path: `${path}/id`, message: 'component id is required' });
  if (!n.type || typeof n.type !== 'string') {
    errors.push({ path: `${path}/type`, message: 'component type is required and must be a string' });
  }
  if (n.children && Array.isArray(n.children)) {
    (n.children as unknown[]).forEach((child, i) => {
      validateComponentNode(child, `${path}/children/${i}`, errors);
    });
  }
}

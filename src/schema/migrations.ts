import { AppDefinition } from './types';
import { defaultTheme } from './defaults';

type Migration = (def: Record<string, unknown>) => Record<string, unknown>;

const CURRENT_VERSION = '1.0.0';

const migrations: Record<string, Migration> = {
  // Future migrations go here:
  // '0.9.0_to_1.0.0': (def) => { ... return def; }
};

export function migrateAppDefinition(raw: unknown): AppDefinition {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid app definition');
  }

  let def = raw as Record<string, unknown>;
  const version = (def.version as string) ?? '1.0.0';

  // Apply migrations in order
  const versionOrder = Object.keys(migrations);
  for (const migKey of versionOrder) {
    const [from] = migKey.split('_to_');
    if (compareVersions(version, from) <= 0) {
      def = migrations[migKey](def);
    }
  }

  // Ensure required fields have defaults
  def.version = CURRENT_VERSION;
  def.$schema = def.$schema ?? 'metaapp://schema/v1';

  if (!def.theme) def.theme = defaultTheme;
  if (!def.dataModels) def.dataModels = {};
  if (!def.dataSources) def.dataSources = {};
  if (!def.state) def.state = {};
  if (!def.actions) def.actions = {};
  if (!Array.isArray(def.screens)) def.screens = [];

  return def as unknown as AppDefinition;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va !== vb) return va - vb;
  }
  return 0;
}

export function getCurrentSchemaVersion(): string {
  return CURRENT_VERSION;
}

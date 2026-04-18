import { AppDefinition, StateVariable } from '../../schema/types';
import { SQLiteAdapter } from './SQLiteAdapter';
import { AsyncStorageAdapter } from './AsyncStorageAdapter';

export class StorageEngine {
  private sqlite: SQLiteAdapter;
  private asyncStorage: AsyncStorageAdapter;
  private stateDefinitions: Record<string, StateVariable>;

  constructor(appDefinition: AppDefinition) {
    const appId = appDefinition.app.id;
    this.sqlite = new SQLiteAdapter(appId);
    this.asyncStorage = new AsyncStorageAdapter(appId);
    this.stateDefinitions = appDefinition.state;
  }

  async initialize(appDefinition: AppDefinition): Promise<void> {
    if (appDefinition.storage) {
      await this.sqlite.initialize(appDefinition.storage);
    }
  }

  async loadPersistedState(): Promise<Record<string, unknown>> {
    const persisted: Record<string, unknown> = {};

    for (const [key, def] of Object.entries(this.stateDefinitions)) {
      if (!def.persist) continue;

      if (def.storage === 'sqlite' && def.table) {
        persisted[key] = this.sqlite.queryAll(def.table);
      } else {
        const value = await this.asyncStorage.get(key);
        if (value !== undefined) {
          persisted[key] = value;
        }
      }
    }

    return persisted;
  }

  async persistState(key: string, value: unknown): Promise<void> {
    const def = this.stateDefinitions[key];
    if (!def?.persist) return;

    if (def.storage === 'sqlite' && def.table) {
      // For SQLite-backed arrays, we sync the whole array
      // Individual CRUD operations should use db actions instead
      return;
    }

    await this.asyncStorage.set(key, value);
  }

  // ---- SQLite CRUD (used by db actions) ----

  dbInsert(table: string, data: Record<string, unknown>): unknown {
    return this.sqlite.insert(table, data);
  }

  dbQuery(
    table: string,
    where?: Record<string, unknown>,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc',
    limit?: number
  ): unknown[] {
    return this.sqlite.query(table, where, orderBy, orderDirection, limit);
  }

  dbUpdate(table: string, data: Record<string, unknown>, where: Record<string, unknown>): number {
    return this.sqlite.update(table, data, where);
  }

  dbDelete(table: string, where: Record<string, unknown>): number {
    return this.sqlite.delete(table, where);
  }

  // ---- Key-Value (settings, preferences) ----

  async getValue(key: string): Promise<unknown> {
    return this.asyncStorage.get(key);
  }

  async setValue(key: string, value: unknown): Promise<void> {
    await this.asyncStorage.set(key, value);
  }

  close(): void {
    this.sqlite.close();
  }
}

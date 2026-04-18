import * as SQLite from 'expo-sqlite';
import { StorageDefinition, TableDefinition, ColumnDefinition } from '../../schema/types';

export class SQLiteAdapter {
  private db: SQLite.SQLiteDatabase;

  constructor(private appId: string) {
    this.db = SQLite.openDatabaseSync(`metaapp_${appId}.db`);
  }

  async initialize(storage: StorageDefinition): Promise<void> {
    for (const [tableName, tableDef] of Object.entries(storage.tables)) {
      await this.createTable(tableName, tableDef);
    }
  }

  private async createTable(name: string, def: TableDefinition): Promise<void> {
    const columns = Object.entries(def.columns).map(([colName, colDef]) => {
      return this.columnToSQL(colName, colDef);
    });

    const sql = `CREATE TABLE IF NOT EXISTS ${sanitizeName(name)} (${columns.join(', ')})`;
    this.db.execSync(sql);

    if (def.indexes) {
      for (const idx of def.indexes) {
        const unique = idx.unique ? 'UNIQUE' : '';
        const cols = idx.columns.map(sanitizeName).join(', ');
        const idxSql = `CREATE ${unique} INDEX IF NOT EXISTS ${sanitizeName(idx.name)} ON ${sanitizeName(name)} (${cols})`;
        this.db.execSync(idxSql);
      }
    }
  }

  private columnToSQL(name: string, def: ColumnDefinition): string {
    const parts = [sanitizeName(name), def.type.toUpperCase()];

    if (def.primaryKey) parts.push('PRIMARY KEY');
    if (def.autoIncrement) parts.push('AUTOINCREMENT');
    if (def.required) parts.push('NOT NULL');
    if (def.unique) parts.push('UNIQUE');
    if (def.default !== undefined) {
      parts.push(`DEFAULT ${this.formatDefault(def.default)}`);
    }

    return parts.join(' ');
  }

  private formatDefault(value: string | number | null): string {
    if (value === null) return 'NULL';
    if (typeof value === 'number') return String(value);
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  insert(table: string, data: Record<string, unknown>): unknown {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map((k) => this.serializeValue(data[k]));
    const sql = `INSERT INTO ${sanitizeName(table)} (${keys.map(sanitizeName).join(', ')}) VALUES (${placeholders})`;

    const result = this.db.runSync(sql, values);
    return { id: result.lastInsertRowId, changes: result.changes };
  }

  query(
    table: string,
    where?: Record<string, unknown>,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc',
    limit?: number
  ): unknown[] {
    let sql = `SELECT * FROM ${sanitizeName(table)}`;
    const params: (string | number | null)[] = [];

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.entries(where).map(([key, value]) => {
        params.push(this.serializeValue(value));
        return `${sanitizeName(key)} = ?`;
      });
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (orderBy) {
      sql += ` ORDER BY ${sanitizeName(orderBy)} ${orderDirection === 'desc' ? 'DESC' : 'ASC'}`;
    }

    if (limit) {
      sql += ` LIMIT ${Math.floor(limit)}`;
    }

    return this.db.getAllSync(sql, params).map((row) => this.deserializeRow(row as Record<string, unknown>));
  }

  update(table: string, data: Record<string, unknown>, where: Record<string, unknown>): number {
    const setClauses = Object.keys(data).map((k) => `${sanitizeName(k)} = ?`);
    const setValues = Object.keys(data).map((k) => this.serializeValue(data[k]));

    const whereClauses = Object.keys(where).map((k) => `${sanitizeName(k)} = ?`);
    const whereValues = Object.keys(where).map((k) => this.serializeValue(where[k]));

    const sql = `UPDATE ${sanitizeName(table)} SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')}`;
    const result = this.db.runSync(sql, [...setValues, ...whereValues]);
    return result.changes;
  }

  delete(table: string, where: Record<string, unknown>): number {
    const conditions = Object.keys(where).map((k) => `${sanitizeName(k)} = ?`);
    const values = Object.keys(where).map((k) => this.serializeValue(where[k]));

    const sql = `DELETE FROM ${sanitizeName(table)} WHERE ${conditions.join(' AND ')}`;
    const result = this.db.runSync(sql, values);
    return result.changes;
  }

  queryAll(table: string): unknown[] {
    return this.db.getAllSync(`SELECT * FROM ${sanitizeName(table)}`).map((row) =>
      this.deserializeRow(row as Record<string, unknown>)
    );
  }

  close(): void {
    this.db.closeSync();
  }

  private serializeValue(value: unknown): string | number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }

  private deserializeRow(row: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'object') {
            result[key] = parsed;
            continue;
          }
        } catch {
          // not JSON, keep as string
        }
      }
      result[key] = value;
    }
    return result;
  }
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '');
}

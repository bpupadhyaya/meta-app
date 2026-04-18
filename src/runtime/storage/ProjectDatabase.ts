import * as SQLite from 'expo-sqlite';
import { AppDefinition } from '../../schema/types';

// This stores MetaApp's own data — the user's saved projects
// Completely on-device, no server needed

export interface SavedProject {
  id: string;
  name: string;
  definition: string; // JSON serialized AppDefinition
  createdAt: string;
  updatedAt: string;
}

export class ProjectDatabase {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('metaapp_projects.db');
    this.initialize();
  }

  private initialize(): void {
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        definition TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
  }

  getAllProjects(): SavedProject[] {
    return this.db.getAllSync(
      'SELECT * FROM projects ORDER BY updatedAt DESC'
    ) as SavedProject[];
  }

  getProject(id: string): SavedProject | null {
    const rows = this.db.getAllSync(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    ) as SavedProject[];
    return rows[0] ?? null;
  }

  saveProject(id: string, name: string, definition: AppDefinition): void {
    const now = new Date().toISOString();
    const json = JSON.stringify(definition);

    const existing = this.getProject(id);
    if (existing) {
      this.db.runSync(
        'UPDATE projects SET name = ?, definition = ?, updatedAt = ? WHERE id = ?',
        [name, json, now, id]
      );
    } else {
      this.db.runSync(
        'INSERT INTO projects (id, name, definition, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [id, name, json, now, now]
      );
    }
  }

  deleteProject(id: string): void {
    this.db.runSync('DELETE FROM projects WHERE id = ?', [id]);
  }

  parseDefinition(project: SavedProject): AppDefinition {
    return JSON.parse(project.definition) as AppDefinition;
  }

  exportProject(id: string): string | null {
    const project = this.getProject(id);
    if (!project) return null;
    return project.definition;
  }

  importProject(json: string, newId: string, newName?: string): void {
    const definition = JSON.parse(json) as AppDefinition;
    definition.app.id = newId;
    if (newName) {
      definition.app.name = newName;
      definition.app.displayName = newName;
    }
    this.saveProject(newId, newName ?? definition.app.displayName, definition);
  }
}

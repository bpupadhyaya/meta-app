import { AppDefinition } from '../schema/types';
import { validateAppDefinition } from '../schema/validator';
import { generateId } from '../utils/idGenerator';
import { ProjectDatabase } from '../runtime/storage/ProjectDatabase';

const projectDb = new ProjectDatabase();

export function exportAppToClipboardString(appDef: AppDefinition): string {
  return JSON.stringify(appDef, null, 2);
}

export async function importAppFromJSON(json: string): Promise<{ success: boolean; error?: string; projectId?: string }> {
  try {
    const parsed = JSON.parse(json);
    const validation = validateAppDefinition(parsed);

    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid app definition: ${validation.errors.map((e) => e.message).join(', ')}`,
      };
    }

    const definition = parsed as AppDefinition;
    const newId = generateId();

    // Assign new ID to avoid conflicts
    definition.app.id = newId;
    definition.app.updatedAt = new Date().toISOString();

    projectDb.saveProject(newId, definition.app.displayName, definition);

    return { success: true, projectId: newId };
  } catch (e) {
    return { success: false, error: `Failed to parse JSON: ${e}` };
  }
}

export function duplicateProject(appDef: AppDefinition, newName: string): string {
  const newId = generateId();
  const now = new Date().toISOString();
  const duplicated: AppDefinition = {
    ...appDef,
    app: {
      ...appDef.app,
      id: newId,
      name: newName.toLowerCase().replace(/\s+/g, '-'),
      displayName: newName,
      createdAt: now,
      updatedAt: now,
    },
  };
  projectDb.saveProject(newId, newName, duplicated);
  return newId;
}

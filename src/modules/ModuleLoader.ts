import { AppDefinition, ModuleManifest } from '../schema/types';
import { ProjectDatabase } from '../runtime/storage/ProjectDatabase';

export interface LoadedModule {
  definition: AppDefinition;
  manifest: ModuleManifest;
}

export class ModuleLoader {
  private projectDb: ProjectDatabase;
  private cache = new Map<string, LoadedModule>();

  constructor() {
    this.projectDb = new ProjectDatabase();
  }

  // Load a module from the local project database
  loadFromProject(projectId: string): LoadedModule | null {
    if (this.cache.has(projectId)) {
      return this.cache.get(projectId)!;
    }

    const project = this.projectDb.getProject(projectId);
    if (!project) return null;

    const definition = this.projectDb.parseDefinition(project);
    if (!definition.module) return null;

    const loaded: LoadedModule = { definition, manifest: definition.module };
    this.cache.set(projectId, loaded);
    return loaded;
  }

  // Load from a raw JSON string (e.g., imported file)
  loadFromJSON(json: string): LoadedModule | null {
    try {
      const definition = JSON.parse(json) as AppDefinition;
      if (!definition.module) return null;
      return { definition, manifest: definition.module };
    } catch {
      return null;
    }
  }

  // List all projects that expose a module manifest
  listAvailableModules(): Array<{ projectId: string; name: string; manifest: ModuleManifest }> {
    const projects = this.projectDb.getAllProjects();
    const modules: Array<{ projectId: string; name: string; manifest: ModuleManifest }> = [];

    for (const project of projects) {
      try {
        const definition = this.projectDb.parseDefinition(project);
        if (definition.module) {
          modules.push({
            projectId: project.id,
            name: project.name,
            manifest: definition.module,
          });
        }
      } catch {
        // Skip invalid definitions
      }
    }

    return modules;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

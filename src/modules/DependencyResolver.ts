import { ModuleManifest, ModuleDependency } from '../schema/types';
import { ModuleLoader } from './ModuleLoader';

export interface ResolvedDependency {
  moduleId: string;
  resolved: boolean;
  error?: string;
}

export class DependencyResolver {
  private loader: ModuleLoader;

  constructor(loader: ModuleLoader) {
    this.loader = loader;
  }

  // Check if all dependencies for a module are satisfied
  resolve(manifest: ModuleManifest): ResolvedDependency[] {
    if (!manifest.dependencies || manifest.dependencies.length === 0) {
      return [];
    }

    const available = this.loader.listAvailableModules();
    const results: ResolvedDependency[] = [];

    for (const dep of manifest.dependencies) {
      const found = available.find((m) => m.manifest.moduleId === dep.moduleId);

      if (!found) {
        results.push({
          moduleId: dep.moduleId,
          resolved: false,
          error: `Module "${dep.moduleId}" not found`,
        });
      } else if (!satisfiesVersion(found.manifest.version, dep.versionRange)) {
        results.push({
          moduleId: dep.moduleId,
          resolved: false,
          error: `Module "${dep.moduleId}" version ${found.manifest.version} does not satisfy ${dep.versionRange}`,
        });
      } else {
        results.push({ moduleId: dep.moduleId, resolved: true });
      }
    }

    return results;
  }

  // Check if all dependencies are satisfied
  allResolved(manifest: ModuleManifest): boolean {
    const results = this.resolve(manifest);
    return results.every((r) => r.resolved);
  }

  // Get ordered list of modules to load (topological sort)
  getLoadOrder(rootModuleId: string): string[] {
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = (moduleId: string) => {
      if (visited.has(moduleId)) return;
      visited.add(moduleId);

      const available = this.loader.listAvailableModules();
      const mod = available.find((m) => m.manifest.moduleId === moduleId);
      if (mod?.manifest.dependencies) {
        for (const dep of mod.manifest.dependencies) {
          visit(dep.moduleId);
        }
      }
      order.push(moduleId);
    };

    visit(rootModuleId);
    return order;
  }
}

// Simple semver check — supports ^major.minor.patch
function satisfiesVersion(version: string, range: string): boolean {
  if (range === '*') return true;

  const prefix = range.charAt(0);
  const rangeVersion = range.replace(/^[\^~>=<]+/, '');

  const [vMajor, vMinor, vPatch] = parseVersion(version);
  const [rMajor, rMinor, rPatch] = parseVersion(rangeVersion);

  if (prefix === '^') {
    // Compatible with major version
    if (vMajor !== rMajor) return false;
    if (vMinor > rMinor) return true;
    if (vMinor === rMinor) return vPatch >= rPatch;
    return false;
  }

  if (prefix === '~') {
    // Compatible with minor version
    if (vMajor !== rMajor || vMinor !== rMinor) return false;
    return vPatch >= rPatch;
  }

  // Exact match
  return vMajor === rMajor && vMinor === rMinor && vPatch === rPatch;
}

function parseVersion(v: string): [number, number, number] {
  const parts = v.split('.').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

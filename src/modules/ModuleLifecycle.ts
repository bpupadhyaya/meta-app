export type ModuleState = 'idle' | 'loading' | 'mounted' | 'suspended' | 'error';

export interface ModuleInstance {
  moduleId: string;
  state: ModuleState;
  mountedAt: number | null;
  error: string | null;
}

export class ModuleLifecycle {
  private instances = new Map<string, ModuleInstance>();

  create(moduleId: string): ModuleInstance {
    const instance: ModuleInstance = {
      moduleId,
      state: 'idle',
      mountedAt: null,
      error: null,
    };
    this.instances.set(moduleId, instance);
    return instance;
  }

  setLoading(moduleId: string): void {
    this.updateState(moduleId, 'loading');
  }

  mount(moduleId: string): void {
    const instance = this.instances.get(moduleId);
    if (instance) {
      instance.state = 'mounted';
      instance.mountedAt = Date.now();
      instance.error = null;
    }
  }

  suspend(moduleId: string): void {
    this.updateState(moduleId, 'suspended');
  }

  resume(moduleId: string): void {
    this.updateState(moduleId, 'mounted');
  }

  setError(moduleId: string, error: string): void {
    const instance = this.instances.get(moduleId);
    if (instance) {
      instance.state = 'error';
      instance.error = error;
    }
  }

  unmount(moduleId: string): void {
    this.instances.delete(moduleId);
  }

  getState(moduleId: string): ModuleState {
    return this.instances.get(moduleId)?.state ?? 'idle';
  }

  getInstance(moduleId: string): ModuleInstance | undefined {
    return this.instances.get(moduleId);
  }

  getAll(): ModuleInstance[] {
    return Array.from(this.instances.values());
  }

  private updateState(moduleId: string, state: ModuleState): void {
    const instance = this.instances.get(moduleId);
    if (instance) {
      instance.state = state;
    }
  }
}

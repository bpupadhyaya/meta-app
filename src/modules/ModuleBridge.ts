type EventHandler = (data: unknown) => void;

interface Subscription {
  event: string;
  handler: EventHandler;
}

export class ModuleBridge {
  private listeners = new Map<string, Set<EventHandler>>();
  private moduleId: string;

  constructor(moduleId: string) {
    this.moduleId = moduleId;
  }

  // Host -> Module or Module -> Host
  emit(event: string, data?: unknown): void {
    const key = this.namespaced(event);
    const handlers = this.listeners.get(key);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (e) {
          console.warn(`ModuleBridge: error in handler for ${key}`, e);
        }
      }
    }
  }

  // Subscribe to events
  on(event: string, handler: EventHandler): () => void {
    const key = this.namespaced(event);
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(handler);

    return () => {
      this.listeners.get(key)?.delete(handler);
    };
  }

  // Send data to a specific module
  sendToModule(targetModuleId: string, event: string, data?: unknown): void {
    const key = `${targetModuleId}:${event}`;
    const handlers = this.listeners.get(key);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (e) {
          console.warn(`ModuleBridge: error sending to ${key}`, e);
        }
      }
    }
  }

  // Emit event to host app
  emitToHost(event: string, data?: unknown): void {
    const key = `host:${event}`;
    const handlers = this.listeners.get(key);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (e) {
          console.warn(`ModuleBridge: error emitting to host`, e);
        }
      }
    }
  }

  // Listen for host events
  onHostEvent(event: string, handler: EventHandler): () => void {
    const key = `host:${event}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(handler);
    return () => { this.listeners.get(key)?.delete(handler); };
  }

  // Listen for events from other modules
  onModuleEvent(sourceModuleId: string, event: string, handler: EventHandler): () => void {
    const key = `${this.moduleId}:${event}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(handler);
    return () => { this.listeners.get(key)?.delete(handler); };
  }

  private namespaced(event: string): string {
    return `${this.moduleId}:${event}`;
  }

  // Clean up all listeners
  destroy(): void {
    this.listeners.clear();
  }
}

// Global bridge registry so modules can find each other
class BridgeRegistryClass {
  private bridges = new Map<string, ModuleBridge>();

  register(moduleId: string, bridge: ModuleBridge): void {
    this.bridges.set(moduleId, bridge);
  }

  get(moduleId: string): ModuleBridge | undefined {
    return this.bridges.get(moduleId);
  }

  unregister(moduleId: string): void {
    const bridge = this.bridges.get(moduleId);
    bridge?.destroy();
    this.bridges.delete(moduleId);
  }

  clear(): void {
    for (const bridge of this.bridges.values()) {
      bridge.destroy();
    }
    this.bridges.clear();
  }
}

export const BridgeRegistry = new BridgeRegistryClass();

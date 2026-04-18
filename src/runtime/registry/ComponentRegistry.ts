import React from 'react';

export interface PropSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'binding' | 'action';
  label: string;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  group?: string;
}

export interface ComponentRegistration {
  component: React.ComponentType<any>;
  displayName: string;
  category: 'primitive' | 'layout' | 'navigation' | 'form' | 'media' | 'custom';
  icon: string;
  defaultProps: Record<string, unknown>;
  editableProps: PropSchema[];
  acceptsChildren: boolean;
  maxChildren?: number;
  events: string[];
}

class ComponentRegistryClass {
  private registry = new Map<string, ComponentRegistration>();

  register(type: string, registration: ComponentRegistration): void {
    this.registry.set(type, registration);
  }

  get(type: string): ComponentRegistration | undefined {
    return this.registry.get(type);
  }

  getComponent(type: string): React.ComponentType<any> | undefined {
    return this.registry.get(type)?.component;
  }

  getAll(): Map<string, ComponentRegistration> {
    return new Map(this.registry);
  }

  getByCategory(category: string): Array<[string, ComponentRegistration]> {
    return Array.from(this.registry.entries()).filter(([, reg]) => reg.category === category);
  }

  has(type: string): boolean {
    return this.registry.has(type);
  }
}

export const ComponentRegistry = new ComponentRegistryClass();

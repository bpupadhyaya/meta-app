import React, { useMemo } from 'react';
import { ComponentNode } from '../schema/types';
import { ComponentRegistry } from './registry/ComponentRegistry';
import { useTheme } from './styling/ThemeProvider';
import { resolveStyles } from './styling/styleResolver';
import { resolveBindings, Scope } from './data/bindingResolver';
import { useRuntimeState } from './state/RuntimeStateProvider';
import { evaluateBoolean, evaluateExpression } from './state/expressionEvaluator';
import { executeActions, ExecutionContext } from './actions/ActionExecutor';
import { StorageEngine } from './storage/StorageEngine';

interface ComponentRendererProps {
  node: ComponentNode;
  extraScope?: Record<string, unknown>;
  actions: Record<string, import('../schema/types').ActionDefinition>;
  storage?: StorageEngine;
  navigation?: ExecutionContext['navigation'];
}

export function ComponentRenderer({ node, extraScope, actions, storage, navigation }: ComponentRendererProps) {
  const theme = useTheme();
  const runtimeState = useRuntimeState();

  const scope: Scope = useMemo(() => ({
    state: runtimeState.values,
    ...extraScope,
  }), [runtimeState.values, extraScope]);

  // Conditional rendering
  if (node.conditional) {
    const visible = evaluateBoolean(node.conditional.$if, scope);
    if (node.conditional.negate ? visible : !visible) {
      return null;
    }
  }

  // Repeat rendering
  if (node.repeat) {
    const items = evaluateExpression(node.repeat.$each, scope);
    if (!Array.isArray(items)) return null;

    return (
      <>
        {items.map((item, index) => {
          const childScope = {
            ...extraScope,
            [node.repeat!.as]: item,
            index,
          };
          const repeatNode = { ...node, repeat: undefined };
          return (
            <ComponentRenderer
              key={item?.[node.repeat!.keyPath] ?? index}
              node={repeatNode}
              extraScope={childScope}
              actions={actions}
              storage={storage}
              navigation={navigation}
            />
          );
        })}
      </>
    );
  }

  // Resolve component from registry
  const registration = ComponentRegistry.get(node.type);
  if (!registration) {
    return null;
  }

  const Component = registration.component;

  // Resolve props (static + bindings)
  const resolvedProps = resolveBindings(node.props, scope);

  // Resolve styles
  const resolvedStyle = resolveStyles(node.style, theme);

  // Wire up event handlers
  const eventHandlers: Record<string, (...args: unknown[]) => void> = {};
  if (node.events) {
    for (const [eventName, actionRefs] of Object.entries(node.events)) {
      eventHandlers[eventName] = (...args: unknown[]) => {
        const eventData = args[0];
        const context: ExecutionContext = {
          state: {
            values: runtimeState.values,
            set: runtimeState.set,
            setNestedValue: runtimeState.setNestedValue,
          },
          navigation,
          actions,
          storage,
          event: { target: node.id, value: eventData },
          localVars: extraScope ?? {},
        };
        executeActions(actionRefs, context);
      };
    }
  }

  // Map event names to RN prop names
  const eventProps: Record<string, unknown> = {};
  if (eventHandlers.onPress) eventProps.onPress = eventHandlers.onPress;
  if (eventHandlers.onChange) eventProps.onChange = eventHandlers.onChange;

  // Render children recursively
  const children = node.children?.map((child) => (
    <ComponentRenderer
      key={child.id}
      node={child}
      extraScope={extraScope}
      actions={actions}
      storage={storage}
      navigation={navigation}
    />
  ));

  return (
    <Component
      {...resolvedProps}
      {...eventProps}
      style={resolvedStyle}
    >
      {children}
    </Component>
  );
}

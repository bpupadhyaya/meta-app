import { Alert } from 'react-native';
import {
  ActionStep,
  ActionReference,
  ActionDefinition,
  SetStateAction,
  NavigateAction,
  AlertAction,
  ConditionalAction,
  DelayAction,
  DbInsertAction,
  DbQueryAction,
  DbUpdateAction,
  DbDeleteAction,
  PropValue,
} from '../../schema/types';
import { evaluateBoolean } from '../state/expressionEvaluator';
import { resolvePropValue, Scope } from '../data/bindingResolver';
import { StorageEngine } from '../storage/StorageEngine';

export interface ExecutionContext {
  state: {
    values: Record<string, unknown>;
    set: (key: string, value: unknown) => void;
    setNestedValue: (path: string, value: unknown) => void;
  };
  navigation?: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
  actions: Record<string, ActionDefinition>;
  storage?: StorageEngine;
  event?: { target: string; value?: unknown };
  localVars: Record<string, unknown>;
}

export async function executeActions(
  refs: ActionReference[],
  context: ExecutionContext
): Promise<void> {
  for (const ref of refs) {
    if (typeof ref === 'string') {
      const action = context.actions[ref];
      if (action) {
        await executeSteps(action.steps, context);
      }
    } else if (ref && typeof ref === 'object' && 'inline' in ref) {
      await executeSteps(ref.inline, context);
    }
  }
}

async function executeSteps(
  steps: ActionStep[],
  context: ExecutionContext
): Promise<void> {
  for (const step of steps) {
    await executeStep(step, context);
  }
}

function buildScope(context: ExecutionContext): Scope {
  return {
    state: context.state.values,
    event: context.event,
    ...context.localVars,
  };
}

function resolveRecord(record: Record<string, PropValue>, scope: Scope): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).map(([k, v]) => [k, resolvePropValue(v, scope)])
  );
}

async function executeStep(
  step: ActionStep,
  context: ExecutionContext
): Promise<void> {
  const scope = buildScope(context);

  switch (step.type) {
    case 'setState': {
      const action = step as SetStateAction;
      const value = resolvePropValue(action.value, scope);
      context.state.setNestedValue(action.key, value);
      // Auto-persist if storage is available
      if (context.storage) {
        await context.storage.persistState(action.key, value);
      }
      break;
    }

    case 'navigate': {
      const action = step as NavigateAction;
      if (!context.navigation) break;
      if (action.mode === 'goBack') {
        context.navigation.goBack();
      } else {
        const params = action.params ? resolveRecord(action.params, scope) : undefined;
        context.navigation.navigate(action.screen, params);
      }
      break;
    }

    case 'alert': {
      const action = step as AlertAction;
      const title = String(resolvePropValue(action.title, scope) ?? '');
      const message = String(resolvePropValue(action.message, scope) ?? '');
      const buttons = action.buttons?.map((btn) => ({
        text: btn.text,
        onPress: btn.actions
          ? () => executeSteps(btn.actions!, context)
          : undefined,
      }));
      Alert.alert(title, message, buttons);
      break;
    }

    case 'conditional': {
      const action = step as ConditionalAction;
      const result = evaluateBoolean(action.condition, scope);
      if (result) {
        await executeSteps(action.then, context);
      } else if (action.else) {
        await executeSteps(action.else, context);
      }
      break;
    }

    case 'delay': {
      const action = step as DelayAction;
      await new Promise((resolve) => setTimeout(resolve, action.ms));
      break;
    }

    // ---- Database Actions (fully offline, on-device) ----

    case 'dbInsert': {
      if (!context.storage) break;
      const action = step as DbInsertAction;
      const data = resolveRecord(action.data, scope);
      const result = context.storage.dbInsert(action.table, data);
      if (action.resultKey) {
        context.state.setNestedValue(action.resultKey, result);
      }
      break;
    }

    case 'dbQuery': {
      if (!context.storage) break;
      const action = step as DbQueryAction;
      const where = action.where ? resolveRecord(action.where, scope) : undefined;
      const results = context.storage.dbQuery(
        action.table,
        where,
        action.orderBy,
        action.orderDirection,
        action.limit
      );
      context.state.setNestedValue(action.resultKey, results);
      break;
    }

    case 'dbUpdate': {
      if (!context.storage) break;
      const action = step as DbUpdateAction;
      const data = resolveRecord(action.data, scope);
      const where = resolveRecord(action.where, scope);
      context.storage.dbUpdate(action.table, data, where);
      break;
    }

    case 'dbDelete': {
      if (!context.storage) break;
      const action = step as DbDeleteAction;
      const where = resolveRecord(action.where, scope);
      context.storage.dbDelete(action.table, where);
      break;
    }

    default:
      break;
  }
}

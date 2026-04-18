import { useCallback, useRef } from 'react';
import { AppDefinition } from '../../schema/types';

const MAX_HISTORY = 50;

export interface UndoRedoControls {
  pushState: (state: AppDefinition) => void;
  undo: () => AppDefinition | null;
  redo: () => AppDefinition | null;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

export function useUndoRedo(): UndoRedoControls {
  const pastRef = useRef<AppDefinition[]>([]);
  const futureRef = useRef<AppDefinition[]>([]);

  const pushState = useCallback((state: AppDefinition) => {
    pastRef.current = [...pastRef.current.slice(-MAX_HISTORY), state];
    futureRef.current = [];
  }, []);

  const undo = useCallback((): AppDefinition | null => {
    if (pastRef.current.length < 2) return null;
    const current = pastRef.current.pop()!;
    futureRef.current.push(current);
    return pastRef.current[pastRef.current.length - 1] ?? null;
  }, []);

  const redo = useCallback((): AppDefinition | null => {
    if (futureRef.current.length === 0) return null;
    const next = futureRef.current.pop()!;
    pastRef.current.push(next);
    return next;
  }, []);

  const clear = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo: pastRef.current.length >= 2,
    canRedo: futureRef.current.length > 0,
    clear,
  };
}

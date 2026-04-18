import { useState, useCallback } from 'react';

export interface SelectionState {
  selectedComponentId: string | null;
  selectedScreenIndex: number;
  select: (componentId: string | null) => void;
  selectScreen: (index: number) => void;
  clearSelection: () => void;
}

export function useSelection(): SelectionState {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0);

  const select = useCallback((componentId: string | null) => {
    setSelectedComponentId(componentId);
  }, []);

  const selectScreen = useCallback((index: number) => {
    setSelectedScreenIndex(index);
    setSelectedComponentId(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedComponentId(null);
  }, []);

  return {
    selectedComponentId,
    selectedScreenIndex,
    select,
    selectScreen,
    clearSelection,
  };
}

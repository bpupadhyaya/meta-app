import React, { createContext, useContext } from 'react';
import { ThemeDefinition } from '../../schema/types';
import { defaultTheme } from '../../schema/defaults';

const ThemeContext = createContext<ThemeDefinition>(defaultTheme);

interface ThemeProviderProps {
  theme: ThemeDefinition;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeDefinition {
  return useContext(ThemeContext);
}

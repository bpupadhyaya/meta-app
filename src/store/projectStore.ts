import { create } from 'zustand';
import { AppDefinition } from '../schema/types';
import { blankTemplate } from '../templates/blank';

export interface SavedProject {
  id: string;
  name: string;
  updatedAt: string;
  definition: AppDefinition;
}

interface ProjectStore {
  projects: SavedProject[];
  currentProject: SavedProject | null;
  setCurrentProject: (project: SavedProject | null) => void;
  addProject: (project: SavedProject) => void;
  updateProject: (id: string, definition: AppDefinition) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, definition) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id
          ? { ...p, definition, updatedAt: new Date().toISOString() }
          : p
      ),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject:
        state.currentProject?.id === id ? null : state.currentProject,
    })),
}));

import { AppDefinition } from '../schema/types';
import { blankTemplate } from './blank';
import { todoAppTemplate } from './todoApp';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  template: AppDefinition;
}

export const templates: TemplateInfo[] = [
  {
    id: 'blank',
    name: 'Blank App',
    description: 'Start from scratch with an empty app',
    template: blankTemplate,
  },
  {
    id: 'todo',
    name: 'Todo App',
    description: 'A simple todo list with add, check, and delete',
    template: todoAppTemplate,
  },
];

export function getTemplate(id: string): AppDefinition | undefined {
  return templates.find((t) => t.id === id)?.template;
}

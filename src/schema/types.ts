// ---- Top-level App Definition ----

export interface AppDefinition {
  $schema: string;
  version: string;
  app: AppMetadata;
  theme: ThemeDefinition;
  dataModels: Record<string, DataModel>;
  dataSources: Record<string, DataSource>;
  storage?: StorageDefinition;
  state: Record<string, StateVariable>;
  screens: ScreenDefinition[];
  navigation: NavigationDefinition;
  actions: Record<string, ActionDefinition>;
  module?: ModuleManifest;
}

// ---- App Metadata ----

export interface AppMetadata {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  icon: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Theme ----

export interface ThemeDefinition {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    [key: string]: string;
  };
  typography: {
    fontFamily: string;
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  darkMode?: ThemeDefinition;
}

// ---- Screens ----

export interface ScreenDefinition {
  id: string;
  name: string;
  title: string;
  rootComponent: ComponentNode;
  onMount?: ActionReference[];
  onUnmount?: ActionReference[];
  scrollable: boolean;
  backgroundColor?: string;
}

// ---- Component Tree ----

export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, PropValue>;
  style?: StyleDefinition;
  children?: ComponentNode[];
  conditional?: ConditionalRule;
  repeat?: RepeatRule;
  events?: Record<string, ActionReference[]>;
}

export type PropValue =
  | string
  | number
  | boolean
  | null
  | PropBinding
  | PropValue[];

export interface PropBinding {
  $bind: string;
  transform?: string;
}

export interface ConditionalRule {
  $if: string;
  negate?: boolean;
}

export interface RepeatRule {
  $each: string;
  as: string;
  keyPath: string;
}

// ---- Navigation ----

export interface NavigationDefinition {
  type: 'stack' | 'tabs' | 'drawer';
  initialScreen: string;
  items: NavigationItem[];
}

export interface NavigationItem {
  screen: string;
  label?: string;
  icon?: string;
  badge?: PropBinding;
  children?: NavigationDefinition;
}

// ---- Data ----

export interface DataModel {
  name: string;
  fields: Record<string, DataField>;
}

export interface DataField {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required?: boolean;
  defaultValue?: unknown;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'custom';
  value?: unknown;
  message: string;
}

export interface DataSource {
  id: string;
  type: 'rest' | 'graphql' | 'local' | 'static';
  baseUrl?: string;
  endpoints?: Record<string, EndpointDefinition>;
  staticData?: unknown;
}

export interface EndpointDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers?: Record<string, string>;
  body?: Record<string, PropValue>;
  responseMapping?: string;
}

export interface StateVariable {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue: unknown;
  persist?: boolean;
  storage?: 'sqlite' | 'asyncstorage';
  table?: string;
}

// ---- Storage (fully offline, on-device) ----

export interface StorageDefinition {
  tables: Record<string, TableDefinition>;
}

export interface TableDefinition {
  columns: Record<string, ColumnDefinition>;
  indexes?: IndexDefinition[];
}

export interface ColumnDefinition {
  type: 'text' | 'integer' | 'real' | 'blob';
  primaryKey?: boolean;
  autoIncrement?: boolean;
  required?: boolean;
  unique?: boolean;
  default?: string | number | null;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
}

// ---- Actions ----

export interface ActionDefinition {
  id: string;
  name: string;
  steps: ActionStep[];
}

export type ActionStep =
  | NavigateAction
  | SetStateAction
  | ApiCallAction
  | ConditionalAction
  | DelayAction
  | AlertAction
  | ValidateAction
  | ModuleCallAction
  | DbInsertAction
  | DbQueryAction
  | DbUpdateAction
  | DbDeleteAction;

export interface NavigateAction {
  type: 'navigate';
  screen: string;
  params?: Record<string, PropValue>;
  mode?: 'push' | 'replace' | 'goBack';
}

export interface SetStateAction {
  type: 'setState';
  key: string;
  value: PropValue;
}

export interface ApiCallAction {
  type: 'apiCall';
  dataSource: string;
  endpoint: string;
  params?: Record<string, PropValue>;
  onSuccess?: ActionStep[];
  onError?: ActionStep[];
  resultKey?: string;
}

export interface ConditionalAction {
  type: 'conditional';
  condition: string;
  then: ActionStep[];
  else?: ActionStep[];
}

export interface DelayAction {
  type: 'delay';
  ms: number;
}

export interface AlertAction {
  type: 'alert';
  title: PropValue;
  message: PropValue;
  buttons?: Array<{ text: string; actions?: ActionStep[] }>;
}

export interface ValidateAction {
  type: 'validate';
  model: string;
  data: string;
  onValid?: ActionStep[];
  onInvalid?: ActionStep[];
}

export interface ModuleCallAction {
  type: 'moduleCall';
  moduleId: string;
  method: string;
  params?: Record<string, PropValue>;
  resultKey?: string;
}

// ---- Database Actions (fully offline, on-device SQLite) ----

export interface DbInsertAction {
  type: 'dbInsert';
  table: string;
  data: Record<string, PropValue>;
  resultKey?: string;
}

export interface DbQueryAction {
  type: 'dbQuery';
  table: string;
  where?: Record<string, PropValue>;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  resultKey: string;
}

export interface DbUpdateAction {
  type: 'dbUpdate';
  table: string;
  data: Record<string, PropValue>;
  where: Record<string, PropValue>;
}

export interface DbDeleteAction {
  type: 'dbDelete';
  table: string;
  where: Record<string, PropValue>;
}

export type ActionReference =
  | string
  | { inline: ActionStep[] };

// ---- Styling ----

export interface StyleDefinition {
  layout?: {
    flex?: number;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justifyContent?: string;
    alignItems?: string;
    alignSelf?: string;
    flexWrap?: 'wrap' | 'nowrap';
  };
  spacing?: {
    margin?: number | string;
    marginTop?: number | string;
    marginBottom?: number | string;
    marginLeft?: number | string;
    marginRight?: number | string;
    padding?: number | string;
    paddingTop?: number | string;
    paddingBottom?: number | string;
    paddingLeft?: number | string;
    paddingRight?: number | string;
  };
  size?: {
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
  };
  appearance?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number | string;
    opacity?: number;
  };
  text?: {
    color?: string;
    fontSize?: number | string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
    letterSpacing?: number;
  };
}

// ---- Module System ----

export interface ModuleManifest {
  moduleId: string;
  version: string;
  exposedScreens: string[];
  exposedActions: string[];
  inputProps: Record<string, DataField>;
  outputEvents: string[];
  dependencies: ModuleDependency[];
}

export interface ModuleDependency {
  moduleId: string;
  versionRange: string;
}

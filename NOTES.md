# MetaApp — Development Notes

## What This Is

A meta-app: a mobile application (iOS & Android) that lets users design, build, and run custom apps — without code, without internet, without installing any dev tools. Built with React Native + Expo + TypeScript.

## Architecture

Four pillars:
1. **App Definition Schema** — Apps are JSON documents describing screens, components, state, navigation, actions, themes, storage
2. **Runtime Engine** — Recursively interprets JSON schema into live native UI with state management, data binding, and action execution
3. **Visual Builder** — (Phase 3, not yet built) On-phone UI for designing apps
4. **Module System** — (Phase 5, not yet built) Embed apps within other apps

## What's Implemented (Phases 1-2 + Storage)

### Schema Layer (`src/schema/`)
- `types.ts` — Full TypeScript type system: AppDefinition, ComponentNode, ActionDefinition, StorageDefinition, DB actions, etc.
- `validator.ts` — Validates app definitions with path-based error reporting
- `defaults.ts` — Default theme, screen, and app definition factories

### Runtime Engine (`src/runtime/`)
- `ComponentRenderer.tsx` — **Core**: recursive renderer with `$bind` prop resolution, `$if` conditional rendering, `$each` repeat rendering, event wiring
- `ScreenRenderer.tsx` — Wraps ComponentRenderer with scroll/static container
- `NavigationRenderer.tsx` — Builds React Navigation (stack or tabs) from schema
- `MetaAppRuntime.tsx` — Top-level: initializes storage, loads persisted state, wires theme + state + navigation

### Expression Evaluator (`src/runtime/state/expressionEvaluator.ts`)
- Safe recursive-descent parser — **NO eval() or Function()**
- Supports: property access (`state.user.name`), arithmetic, comparisons, logical ops (`&&`, `||`, `!`), ternary (`? :`), function calls (`len()`, `upper()`, etc.)
- Template strings: `"Hello, {{state.name}}!"`

### State Management (`src/runtime/state/RuntimeStateProvider.tsx`)
- Zustand-based per-app state with nested path access (`setNestedValue("user.name", "Alice")`)
- Factory pattern supports multiple simultaneous app runtimes (for module system)

### Action System (`src/runtime/actions/ActionExecutor.ts`)
- `setState` — set state values
- `navigate` — push/replace/goBack
- `alert` — native alert dialogs with action buttons
- `conditional` — if/then/else logic
- `delay` — wait N milliseconds
- `dbInsert`, `dbQuery`, `dbUpdate`, `dbDelete` — SQLite CRUD (fully offline)
- Actions can be named (reusable) or inline

### Data Binding (`src/runtime/data/bindingResolver.ts`)
- Resolves `{ $bind: "state.todos" }` against runtime state
- Supports transforms: `uppercase`, `lowercase`, `trim`, `toString`, `toNumber`
- Template string resolution: `{{state.count}} items`

### Theme System (`src/runtime/styling/`)
- `ThemeProvider.tsx` — React context for theme
- `styleResolver.ts` — Resolves `$colors.primary`, `$spacing.md`, `$borderRadius.lg` tokens against theme

### Offline Storage (`src/runtime/storage/`)
- `SQLiteAdapter.ts` — Full CRUD on device SQLite (built into iOS & Android, no extra install)
- `AsyncStorageAdapter.ts` — Key-value storage for settings/preferences
- `StorageEngine.ts` — Unified interface: auto-creates tables, loads persisted state on launch, auto-saves
- `ProjectDatabase.ts` — Stores MetaApp's own saved projects in SQLite

### Components (`src/components/`)
- **Primitives**: MetaText, MetaButton, MetaImage, MetaInput, MetaSwitch
- **Layout**: MetaView, MetaScrollView, MetaCard, MetaSpacer
- **Forms**: MetaCheckbox
- All registered in `src/runtime/registry/builtins.ts` with editable prop schemas for the future builder

### Component Registry (`src/runtime/registry/`)
- `ComponentRegistry.ts` — Singleton mapping type strings ("text", "button", "view") to React Native components
- `builtins.ts` — Registers all 10 built-in components with metadata (displayName, category, icon, editableProps, events)
- Extensible: custom components can be registered for modules

### Templates (`src/templates/`)
- `blank.ts` — Empty app with welcome text
- `todoApp.ts` — Todo list with input, add button, checkbox list, conditional empty state, filters
- `index.ts` — Template registry

### Entry Point
- `App.tsx` — Launcher UI showing template cards, tap to run via MetaAppRuntime
- `index.ts` — Expo entry point

### Stores (`src/store/`)
- `projectStore.ts` — Zustand store for managing saved projects (will be used by builder)

## Tech Stack

- **React Native** 0.76.6 + **Expo** SDK 52
- **TypeScript** 5.x (strict mode)
- **Zustand** 5.x (state management)
- **React Navigation** 7.x (native stack + bottom tabs)
- **expo-sqlite** (on-device SQLite)
- **@react-native-async-storage/async-storage** (key-value storage)
- **uuid** (component/project ID generation)

## Key Design Decisions

1. **JSON schema, not custom DSL** — universally toolable, diffable, portable
2. **Safe expression evaluator** — recursive-descent parser, no eval/Function for security
3. **Theme tokens (`$colors.primary`)** — components are theme-independent, dark mode is just a theme swap
4. **Component IDs required** — enables builder selection, undo/redo patches, runtime memoization
5. **Fully offline** — SQLite + AsyncStorage, zero server dependency, works in airplane mode
6. **Cross-platform from single codebase** — React Native renders to native iOS and Android

## What's Next

### Phase 3: Visual Builder (HIGH PRIORITY)
The on-phone UI where users actually design apps. Files to create in `src/builder/`:
- `BuilderScreen.tsx` — Main builder layout (palette + canvas + properties)
- `screens/ScreenListPanel.tsx` — Add/remove/reorder screens
- `palette/ComponentPalette.tsx` — Tappable grid of available components
- `properties/PropertyEditor.tsx` — Dynamic form for selected component props
- `preview/PreviewModal.tsx` — Full-screen preview using MetaAppRuntime
- `theme/ThemeEditor.tsx` — Color/font/spacing picker
- `hooks/useBuilderState.ts` — Builder state management
- `hooks/useSelection.ts` — Track selected component
- `hooks/useUndoRedo.ts` — Undo/redo for schema edits

Update `App.tsx` to add navigation: Launcher → Project List → Builder → Preview

### Phase 4: Advanced Builder
- Binding editor (bind props to state visually)
- State editor (define state variables)
- Action/workflow editor (chain action steps visually)
- Condition editor (visual if/else builder)
- More form components (DatePicker, Dropdown)

### Phase 5: Module System
- `src/modules/ModuleHost.tsx` — Render embedded module
- `src/modules/ModuleBridge.ts` — Inter-module event bus
- `src/modules/ModuleLoader.ts` — Load module definitions
- Module browser in builder

### Phase 6: Polish
- Export/import app definitions as JSON files
- Schema version migrations
- Performance optimization (memoize ComponentRenderer)
- Error boundaries
- Accessibility

## How to Run

```bash
npm install
npx expo start
# Press 'i' for iOS Simulator, 'a' for Android Emulator
# Or scan QR with Expo Go app on physical device
```

## File Count
- 36 TypeScript source files
- 0 TypeScript errors
- All code is cross-platform (iOS + Android from same source)

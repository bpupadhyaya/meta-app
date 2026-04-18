# MetaApp

**Create custom mobile apps on your phone — no coding, no internet, no dev tools required.**

MetaApp is an app that lets you design and build other apps, right on your iPhone or Android device. Your apps run natively, store data locally on your device, and work completely offline.

---

## Quick Start

### For End Users (Phone)

1. Install **MetaApp** from the App Store or Google Play
2. Open MetaApp
3. Tap a template or create a new app
4. Design your app using the visual builder
5. Preview and use your app — it runs right inside MetaApp

No accounts, no internet, no subscriptions. Everything stays on your device.

### For Developers (Building from Source)

```bash
git clone https://github.com/bpupadhyaya/meta-app.git
cd meta-app
npm install
npx expo start
```

Then press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with the **Expo Go** app on your phone.

---

## How to Create an App

### Step 1: Choose a Starting Point

When you open MetaApp, you'll see templates:

| Template | What It Does |
|---|---|
| **Blank** | Empty app — start from scratch |
| **Todo** | Todo list with add, check off, and delete |

Tap a template to start building, or use it as-is.

### Step 2: Design Your Screens

Each app is made of **screens**. A screen contains **components** arranged in a layout:

#### Available Components

| Component | What It Does | Example Use |
|---|---|---|
| **Text** | Display text | Headings, labels, descriptions |
| **Button** | Tappable button | Submit, navigate, trigger actions |
| **Input** | Text field | Names, emails, search bars |
| **Image** | Show an image | Photos, logos, icons |
| **Switch** | Toggle on/off | Settings, preferences |
| **Checkbox** | Check/uncheck | Todo items, multi-select |
| **View** | Container | Group components, create layouts |
| **ScrollView** | Scrollable area | Long lists, forms |
| **Card** | Elevated container | List items, info cards |
| **Spacer** | Empty space | Spacing between components |

#### Layout

Components use **flexbox** for layout:
- **Column** (default): stack components vertically
- **Row**: place components side by side
- Nest Views inside Views for complex layouts

### Step 3: Add Data (State)

Your app can store and manage data using **state variables**:

| Type | Example | Use Case |
|---|---|---|
| `string` | `"John"` | Names, text, emails |
| `number` | `42` | Counts, prices, scores |
| `boolean` | `true/false` | Toggles, flags |
| `array` | `[{...}, {...}]` | Lists of items |
| `object` | `{name: "John"}` | Grouped data |

State can be **persisted** — data survives app restarts using on-device storage.

### Step 4: Connect Components to Data (Bindings)

Make your UI dynamic by binding component props to state:

```
Text shows: { $bind: "state.userName" }
Input value: { $bind: "state.searchText" }
Checkbox checked: { $bind: "item.completed" }
```

You can also use expressions:
```
state.count > 0
state.firstName + " " + state.lastName
len(state.todos)
```

### Step 5: Add Interactivity (Actions)

Wire up events to actions — no code needed:

| Action | What It Does | Example |
|---|---|---|
| **setState** | Change a state value | Update text, toggle checkbox |
| **navigate** | Go to another screen | Open details page |
| **alert** | Show a popup dialog | Confirm delete |
| **conditional** | If/then/else logic | Only add if text is not empty |
| **delay** | Wait before next action | Show loading state |
| **dbInsert** | Save to local database | Add a new contact |
| **dbQuery** | Read from local database | Load all contacts |
| **dbUpdate** | Update database record | Change contact phone number |
| **dbDelete** | Delete from database | Remove a contact |

Example: a button that adds a todo item:
```
Button "Add" → onPress:
  1. conditional: if len(state.newText) > 0
  2. then: dbInsert into "todos" table
  3. then: setState newText = ""
  4. then: dbQuery "todos" → state.todos
```

### Step 6: Add a Local Database (Optional)

For apps that need structured data storage (contacts, inventory, recipes, etc.), define tables:

```
Table: "contacts"
  - id (text, primary key)
  - name (text, required)
  - phone (text)
  - email (text)
  - favorite (integer, default 0)
```

The database is **SQLite** — it's built into every iPhone and Android device. Your data:
- Stays on your device (never sent anywhere)
- Survives app restarts
- Works without internet
- Can store millions of records

### Step 7: Style Your App (Theming)

Customize the look with a theme:

| Setting | What It Controls |
|---|---|
| **Primary color** | Buttons, links, accents |
| **Background** | Screen background |
| **Surface** | Cards, inputs background |
| **Text** | Main text color |
| **Typography** | Font sizes (xs through xxl) |
| **Spacing** | Margins and padding |
| **Border radius** | Corner roundness |

Components reference theme tokens (`$colors.primary`, `$spacing.md`) so changing the theme updates the entire app instantly.

### Step 8: Add Navigation

Choose how users move between screens:

| Type | Behavior |
|---|---|
| **Stack** | Screens push/pop like a deck of cards (with back button) |
| **Tabs** | Bottom tab bar for switching between main sections |

You can nest stacks inside tabs for complex navigation.

---

## Example: Building a Contacts App

Here's what a contacts app would look like:

**Screens:**
1. **Contact List** — shows all contacts in a scrollable list
2. **Add Contact** — form with name, phone, email fields
3. **Contact Detail** — shows one contact's info

**Database table:** `contacts` with columns `id`, `name`, `phone`, `email`

**State:** `contacts` (array, persisted via SQLite), `searchText` (string)

**Flow:**
- Contact List loads contacts from SQLite on mount (`dbQuery`)
- Tap "+" button → navigate to Add Contact screen
- Fill in fields → tap Save → `dbInsert` → navigate back
- Contact List refreshes with new data
- Tap a contact → navigate to Detail with contact ID
- Swipe to delete → `dbDelete` → refresh list

No server needed. All data on your phone. Works on a plane.

---

## App Definition Format

Under the hood, every app is a JSON document. You don't need to write JSON — the visual builder generates it — but here's the structure:

```json
{
  "$schema": "metaapp://schema/v1",
  "version": "1.0.0",
  "app": {
    "id": "my-app",
    "name": "my-app",
    "displayName": "My App",
    "version": "1.0.0"
  },
  "theme": { "colors": { "primary": "#6366F1", "..." : "..." } },
  "storage": {
    "tables": {
      "items": {
        "columns": {
          "id": { "type": "text", "primaryKey": true },
          "name": { "type": "text", "required": true }
        }
      }
    }
  },
  "state": {
    "items": { "type": "array", "defaultValue": [], "persist": true, "storage": "sqlite", "table": "items" }
  },
  "screens": [
    {
      "name": "home",
      "title": "Home",
      "rootComponent": {
        "type": "view",
        "children": [
          { "type": "text", "props": { "text": "Hello!" } }
        ]
      }
    }
  ],
  "navigation": { "type": "stack", "initialScreen": "home", "items": [{ "screen": "home" }] },
  "actions": {}
}
```

You can also export/import app definitions as JSON to share with others or back up your work.

---

## Key Features

- **No code** — design apps visually with tap-and-configure
- **No internet** — everything runs and stores data on your device
- **No dev tools** — no Xcode, no Android Studio, no terminal
- **Cross-platform** — same app runs on iOS and Android
- **Local database** — SQLite for structured data, built into every phone
- **Persistent storage** — data survives app restarts
- **Themeable** — change colors/fonts/spacing globally
- **Extensible** — apps can be embedded as modules inside other apps
- **Exportable** — share app definitions as JSON files

---

## Supported Platforms

| Platform | Requirement |
|---|---|
| iPhone | iOS 13.4+ |
| iPad | iPadOS 13.4+ |
| Android | Android 6.0+ (API 23) |

---

## Privacy

- All data stays on your device
- No accounts required
- No analytics or tracking
- No server communication (unless your app explicitly calls an external API)
- Your apps and data are yours

---

## License

MIT

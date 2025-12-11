# ForeverWeb — Crimson Core

A futuristic, fully-animated web-native webOS with Crimson Core UI theme.

## Features

### 🎨 Crimson Core Theme
- **Deep black + crimson red** color palette with neon accents
- **Particle field** background with slow-moving red particles
- **Cursor glow** that follows your mouse with parallax effect
- **Window trails** when dragging windows

### 🔐 Login & Authentication
- **Typewriter intro** animation
- **Boot sequence** visual effects
- **Local storage** persistence
- **Sound effects** (toggle in settings)

### 🪟 Window Manager
- **Draggable windows** with smooth movement
- **Minimize/Maximize** controls
- **Window stacking** with z-index management
- **Drag trails** show motion paths
- **Close animation** with fade and scale effect
- **Sound feedback** for all interactions

### 🎛️ Taskbar & Dashboard
- **Launcher button** opens app dashboard
- **Dock icons** for quick app access
- **App dashboard** grid of available apps
- **Settings panel** for animation speed and sound control

### ⚡ APIs
- **forever.ipc** — Inter-process communication between apps
- **forever.fs** — Virtual filesystem stubs
- **forever.notify** — Notification system
- **forever.settings** — Persistent settings storage

### 🔊 Sound System
- **Boot beep** on login
- **Window open/close** sounds
- **Button click** feedback
- **Toggle on/off** in settings

### ⚙️ Customization
- **Animation speed**: Slow / Normal / Fast
- **Sound effects**: On / Off
- All settings persist to localStorage

## Quick Start

```bash
cd foreverweb
npm install
npm run dev -- --host 0.0.0.0
```

Then open the dev server URL (typically `http://localhost:5173`).

## Project Structure

```
src/
├── components/
│   ├── App.tsx              # Main shell
│   ├── LoginPanel.tsx       # Login/auth UI
│   ├── WindowManager.tsx    # Window management
│   ├── Taskbar.tsx          # Dock/launcher
│   ├── AppDashboard.tsx     # App grid
│   ├── SettingsPanel.tsx    # Settings UI
│   ├── ParticleField.tsx    # Particle background
│   └── CursorGlow.tsx       # Cursor effect + parallax
├── apps/
│   ├── TextEditorApp.tsx    # Sample text editor
│   ├── BrowserApp.tsx       # Sample browser
│   └── FilesApp.tsx         # Sample file manager
├── lib/
│   ├── forever.ts           # Forever API (ipc, fs, notify, settings)
│   ├── soundSystem.ts       # Audio effects
│   ├── bundleSystem.ts      # App packaging (fflate)
│   └── appLoader.tsx        # App component loader
└── styles/
    └── tailwind.css         # Animations & theme
```

## API Reference

### forever.ipc
```typescript
forever.ipc.send(channel: string, data: unknown)
forever.ipc.on(channel: string, handler: (data: unknown) => void)
```

### forever.fs
```typescript
await forever.fs.read(path: string): string
await forever.fs.write(path: string, data: string): void
await forever.fs.list(path: string): string[]
```

### forever.notify
```typescript
forever.notify.show(title: string, opts?: { body?: string; icon?: string })
```

### forever.settings
```typescript
forever.settings.get(key: string, def?: unknown): unknown
forever.settings.set(key: string, value: unknown): void
```

## Roadmap

- [ ] App bundling system (fflate packaging complete)
- [ ] App store backend (Node/Express API)
- [ ] Advanced window manager (snap, workspaces, 3D cube)
- [ ] Compatibility layers (Liquor for Anura, Lemonade for Electron)
- [ ] Media viewer, terminal, text editor apps
- [ ] PWA support and offline functionality
- [ ] Multi-workspace support

## Theme Details

- **Background**: `#000` (deep black)
- **Panels**: `#0b0b0b` with 60% opacity
- **Accent**: `#ff1a2a` (neon crimson)
- **Glow**: Soft red shadow effects
- **Animations**: Smooth easing with `--anim-mult` CSS variable for speed control

## License

MIT

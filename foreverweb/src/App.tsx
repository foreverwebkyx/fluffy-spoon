import React from 'react'
import WindowManager from './components/WindowManager'
import ParticleField from './components/ParticleField'
import CursorGlow from './components/CursorGlow'
import Taskbar from './components/Taskbar'
import AppDashboard from './components/AppDashboard'
import SettingsPanel from './components/SettingsPanel'
import CommandPalette from './components/CommandPalette'
import NotificationCenter from './components/NotificationCenter'
import SystemTray from './components/SystemTray'
import UserMenu from './components/UserMenu'
import WelcomePage from './components/WelcomePage'
import AdvancedLoginPanel from './components/AdvancedLoginPanel'
import BootScreen from './components/BootScreen'
import LockScreen from './components/LockScreen'
import { useEffect, useState } from 'react'
import { APP_REGISTRY, getAppComponent } from './lib/appLoader'
import './lib/forever' // Initialize forever API

type AppState = 'welcome' | 'login' | 'boot' | 'desktop' | 'locked'

interface Command {
  id: string
  label: string
  category: 'app' | 'action' | 'ai'
  icon?: string
  action: () => void
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('welcome')
  const [user, setUser] = useState<string | null>(null)
  const [dashOpen, setDashOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('forever:user')
    if (stored) setUser(stored)
    // set animation multiplier default
    if (!document.documentElement.style.getPropertyValue('--anim-mult')) document.documentElement.style.setProperty('--anim-mult', '1')
  }, [])

  useEffect(() => {
    // Log a boot message
    console.log('%c✦ Crimson Core System Online ✦', 'color: #ff1a2a; font-weight: bold; font-size: 14px;')
    console.log('%cForever API available globally. Use `forever.ipc`, `forever.fs`, `forever.notify`, `forever.settings`', 'color: #888; font-size: 12px;')
  }, [])

  // Keyboard shortcut: Ctrl+K / Cmd+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(!paletteOpen)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [paletteOpen])

  const commands: Command[] = [
    ...APP_REGISTRY.map(app => ({
      id: app.id,
      label: app.name,
      category: 'app' as const,
      icon: app.icon,
      action: () => {
        setPaletteOpen(false)
      }
    })),
    {
      id: 'settings',
      label: 'Settings',
      category: 'action' as const,
      icon: '⚙️',
      action: () => { setSettingsOpen(true); setPaletteOpen(false) }
    },
    {
      id: 'dashboard',
      label: 'App Dashboard',
      category: 'action' as const,
      icon: '📊',
      action: () => { setDashOpen(true); setPaletteOpen(false) }
    },
    {
      id: 'ai-help',
      label: 'Ask AI Assistant',
      category: 'ai' as const,
      icon: '🤖',
      action: () => { setPaletteOpen(false) }
    }
  ]

  // Welcome page
  if (appState === 'welcome') {
    return <WelcomePage onEnter={() => setAppState('login')} />
  }

  // Login screen
  if (appState === 'login') {
    return (
      <div className="min-h-screen bg-black text-white antialiased">
        <ParticleField />
        <CursorGlow />
        <AdvancedLoginPanel
          onLogin={u => {
            setUser(u)
            setAppState('boot')
          }}
        />
      </div>
    )
  }

  // Boot screen
  if (appState === 'boot') {
    return <BootScreen onComplete={() => setAppState('desktop')} />
  }

  // Lock screen
  if (appState === 'locked' && user) {
    return <LockScreen username={user} onUnlock={() => setAppState('desktop')} />
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <ParticleField />
      <CursorGlow />
      <AppDashboard open={dashOpen} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} currentUser={user ?? undefined} />
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
      <NotificationCenter />
      <SystemTray />

      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black/70" />
      <div className="relative z-10">
        <header className="p-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-crimson cursor-pointer hover:opacity-80" onClick={() => setPaletteOpen(true)}>
            ForeverWeb — Crimson Core
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <UserMenu
                username={user}
                onLogout={() => { setAppState('welcome'); setUser(null) }}
                onLock={() => setAppState('locked')}
                onSwitch={() => { setAppState('login'); setUser(null) }}
              />
            )}
          </div>
        </header>

        <main className="p-6">
          <section className="mb-6">
            <div className="p-6 rounded-lg bg-gray-900/40 border border-crimson/20 backdrop-blur-sm">
              <p className="text-gray-300">Press <code className="bg-black/40 px-2 py-1 rounded text-crimson">Ctrl+K</code> for command palette • Launch apps from the dock • Click the + button to add new windows</p>
            </div>
          </section>

          <WindowManager />
        </main>
      </div>

      <Taskbar onOpenDashboard={() => setDashOpen(true)} />

      <footer className="fixed left-0 right-0 bottom-0 p-3 pointer-events-none" />
    </div>
  )
}

import React, { useMemo } from 'react'
import TextEditorApp from '../apps/TextEditorApp'
import BrowserApp from '../apps/BrowserApp'
import FilesApp from '../apps/FilesApp'
import CalculatorApp from '../apps/CalculatorApp'
import FileExplorerApp from '../apps/FileExplorerApp'
import MediaPlayerApp from '../apps/MediaPlayerApp'
import GalleryApp from '../apps/GalleryApp'
import ChatApp from '../apps/ChatApp'
import GameArcadeApp from '../apps/GameArcadeApp'

type AppContent = { [appId: string]: React.ReactNode }

export const APP_REGISTRY = [
  { id: 'editor', name: 'Text Editor', icon: '📝' },
  { id: 'browser', name: 'Browser', icon: '🌐' },
  { id: 'files', name: 'Files', icon: '📁' },
  { id: 'calculator', name: 'Calculator', icon: '🧮' },
  { id: 'fileexplorer', name: 'File Explorer', icon: '🗂️' },
  { id: 'media', name: 'Media Player', icon: '🎵' },
  { id: 'gallery', name: 'Gallery', icon: '🖼️' },
  { id: 'chat', name: 'Chat', icon: '💬' },
  { id: 'games', name: 'Arcade Games', icon: '🎮' }
]

export function getAppComponent(appId: string, props?: unknown): React.ReactNode {
  const apps: AppContent = {
    editor: <TextEditorApp />,
    browser: <BrowserApp />,
    files: <FilesApp />,
    calculator: <CalculatorApp />,
    fileexplorer: <FileExplorerApp />,
    media: <MediaPlayerApp />,
    gallery: <GalleryApp />,
    chat: <ChatApp />,
    games: <GameArcadeApp />
  }
  return apps[appId] || <div className="p-4 text-gray-400">Unknown app: {appId}</div>
}

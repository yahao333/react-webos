import React, { useState } from 'react';
import { AppID, AppConfig, WindowState } from './types';
import Window from './components/Window';
import { DesktopIcon, Taskbar, StartMenu } from './components/System';
import { TerminalApp } from './components/Terminal';
import { NotepadApp, BrowserApp, PaintApp, CalculatorApp, VSCodeApp, VideoEditorApp } from './components/Apps';

// --- REGISTRY ---
const APPS: AppConfig[] = [
  { id: AppID.TERMINAL, name: 'Terminal', icon: 'fas fa-terminal', color: 'bg-black', defaultSize: { width: 600, height: 400 }, component: TerminalApp },
  { id: AppID.NOTEPAD, name: 'Notepad', icon: 'fas fa-file-alt', color: 'bg-blue-500', defaultSize: { width: 500, height: 400 }, component: NotepadApp },
  { id: AppID.VSCODE, name: 'Code', icon: 'fas fa-code', color: 'bg-blue-600', defaultSize: { width: 800, height: 600 }, component: VSCodeApp },
  { id: AppID.BROWSER, name: 'Edge', icon: 'fab fa-edge', color: 'bg-blue-400', defaultSize: { width: 900, height: 600 }, component: BrowserApp },
  { id: AppID.PAINT, name: 'Paint', icon: 'fas fa-paint-brush', color: 'bg-yellow-500', defaultSize: { width: 700, height: 500 }, component: PaintApp },
  { id: AppID.CALCULATOR, name: 'Calc', icon: 'fas fa-calculator', color: 'bg-green-500', defaultSize: { width: 300, height: 450 }, component: CalculatorApp },
  { id: AppID.VIDEO_EDITOR, name: 'Video', icon: 'fas fa-film', color: 'bg-purple-600', defaultSize: { width: 800, height: 500 }, component: VideoEditorApp },
];

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(10);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // --- WINDOW MANAGEMENT ---
  const openWindow = (appId: AppID) => {
    const app = APPS.find(a => a.id === appId);
    if (!app) return;

    // Check if app already open (optional, for simplicity we allow multiple instances except maybe browser/settings)
    // For this demo, let's allow multiple except for unique ones if needed.
    
    const newWindow: WindowState = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: app.name,
      icon: app.icon,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
      position: { x: 50 + (windows.length * 20), y: 50 + (windows.length * 20) },
      size: app.defaultSize,
      content: <app.component />
    };

    setWindows([...windows, newWindow]);
    setNextZIndex(prev => prev + 1);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const focusWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w));
    setNextZIndex(prev => prev + 1);
    setStartMenuOpen(false);
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const maximizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const restoreWindow = (id: string) => {
    // Used from Taskbar
    const win = windows.find(w => w.id === id);
    if (win?.isMinimized) {
        setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w));
        setNextZIndex(prev => prev + 1);
    } else {
        focusWindow(id);
    }
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, position: { x, y } } : w));
  };

  // Taskbar handler
  const handleTaskbarClick = (appId: AppID) => {
    const openInstances = windows.filter(w => w.appId === appId);
    if (openInstances.length > 0) {
        // If multiple, open latest. If minimized, restore. If focused, minimize.
        const lastActive = openInstances[openInstances.length - 1];
        if (lastActive.isMinimized) {
            restoreWindow(lastActive.id);
        } else if (lastActive.zIndex === Math.max(...windows.map(w => w.zIndex))) {
            minimizeWindow(lastActive.id);
        } else {
            focusWindow(lastActive.id);
        }
    } else {
        openWindow(appId);
    }
  };

  return (
    <div 
      className="w-screen h-screen overflow-hidden bg-cover bg-center relative dark" 
      style={{ backgroundImage: 'url(https://picsum.photos/1920/1080?blur=2)' }}
      onClick={() => setStartMenuOpen(false)}
    >
      {/* Desktop Icons Area */}
      <div className="absolute top-0 left-0 w-full h-full p-4 grid grid-flow-col grid-rows-6 gap-4 content-start justify-start z-0">
        {APPS.map(app => (
          <DesktopIcon key={app.id} app={app} onClick={() => openWindow(app.id)} />
        ))}
      </div>

      {/* Windows Layer */}
      {windows.map(win => (
        <Window 
          key={win.id}
          windowState={win}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onFocus={focusWindow}
          onMove={moveWindow}
        />
      ))}

      {/* System Layer */}
      <StartMenu 
        isOpen={startMenuOpen} 
        apps={APPS} 
        onLaunch={openWindow} 
        onClose={() => setStartMenuOpen(false)}
      />
      
      <Taskbar 
        runningApps={windows.map(w => ({ id: w.id, appId: w.appId, active: !w.isMinimized && w.zIndex === Math.max(...windows.map(z => z.zIndex)) }))}
        allApps={APPS}
        onAppClick={handleTaskbarClick}
        onStartClick={() => setStartMenuOpen(!startMenuOpen)}
        startOpen={startMenuOpen}
      />
    </div>
  );
};

export default App;
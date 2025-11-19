import React, { useState, useEffect } from 'react';
import { AppConfig, AppID } from '../types';

// --- DESKTOP ICON ---
export const DesktopIcon: React.FC<{ app: AppConfig; onClick: () => void }> = ({ app, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center justify-center w-24 h-24 hover:bg-white/10 border border-transparent hover:border-white/20 rounded-lg cursor-pointer transition-all group active:scale-95"
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-3xl shadow-lg mb-2 text-white ${app.color} bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm`}>
        <i className={app.icon}></i>
      </div>
      <span className="text-white text-xs font-medium drop-shadow-md text-center leading-tight px-1">{app.name}</span>
    </div>
  );
};

// --- START MENU ---
export const StartMenu: React.FC<{ 
  isOpen: boolean; 
  apps: AppConfig[]; 
  onLaunch: (id: AppID) => void; 
  onClose: () => void 
}> = ({ isOpen, apps, onLaunch, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 w-[600px] h-[500px] bg-slate-100/80 dark:bg-[#202020]/80 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 dark:border-white/10 p-6 flex flex-col z-50 animate-[slideUp_0.2s_ease-out] overflow-hidden">
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Type here to search" 
          className="w-full bg-white dark:bg-[#2c2c2c] border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-sm outline-none focus:border-blue-500 dark:text-white"
        />
      </div>
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4 pl-2">Pinned</div>
      <div className="grid grid-cols-6 gap-4">
        {apps.map(app => (
          <button 
            key={app.id} 
            onClick={() => { onLaunch(app.id); onClose(); }}
            className="flex flex-col items-center gap-2 p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded transition-colors"
          >
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl text-white ${app.color}`}>
               <i className={app.icon}></i>
            </div>
            <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">{app.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-auto pt-4 border-t border-gray-300 dark:border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
            <span className="text-sm font-medium dark:text-white">User</span>
        </div>
        <button className="text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded">
            <i className="fas fa-power-off"></i>
        </button>
      </div>
    </div>
  );
};

// --- TASKBAR ---
export const Taskbar: React.FC<{ 
  runningApps: {id: string, appId: AppID, active: boolean}[]; 
  allApps: AppConfig[];
  onAppClick: (appId: AppID) => void; 
  onStartClick: () => void;
  startOpen: boolean;
}> = ({ runningApps, allApps, onAppClick, onStartClick, startOpen }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-12 w-full bg-slate-100/80 dark:bg-[#1a1a1a]/85 backdrop-blur-xl border-t border-white/20 absolute bottom-0 left-0 z-50 flex items-center justify-between px-4">
        {/* Start & Apps */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1 h-full">
            <button 
                onClick={onStartClick}
                className={`h-10 w-10 rounded hover:bg-white/50 dark:hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 ${startOpen ? 'bg-white/40' : ''}`}
            >
                <i className="fab fa-windows text-blue-500 text-xl"></i>
            </button>
            
            {/* Pinned/Running Apps */}
            {allApps.slice(0, 6).map(app => {
                const isRunning = runningApps.some(w => w.appId === app.id);
                const isActive = runningApps.some(w => w.appId === app.id && w.active);
                
                return (
                    <div key={app.id} className="relative h-full flex items-center">
                        <button 
                            onClick={() => onAppClick(app.id)}
                            className={`h-10 w-10 rounded hover:bg-white/50 dark:hover:bg-white/10 flex items-center justify-center transition-all relative ${isActive ? 'bg-white/40 dark:bg-white/10' : ''}`}
                        >
                            <i className={`${app.icon} text-lg text-gray-600 dark:text-gray-300`}></i>
                        </button>
                        {isRunning && (
                            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1 rounded-full transition-all ${isActive ? 'w-4 bg-blue-500' : 'bg-gray-400'}`}></div>
                        )}
                    </div>
                )
            })}
        </div>

        {/* System Tray */}
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 h-full px-2 hover:bg-white/20 rounded transition-colors cursor-default">
            <div className="flex flex-col items-end leading-tight">
                <span>{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span>{time.toLocaleDateString()}</span>
            </div>
            <i className="fas fa-bell"></i>
        </div>
    </div>
  );
};
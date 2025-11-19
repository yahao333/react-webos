import React, { useState, useEffect, useRef } from 'react';
import { WindowState, AppID } from '../types';

interface WindowProps {
  windowState: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

const Window: React.FC<WindowProps> = ({ windowState, onClose, onMinimize, onMaximize, onFocus, onMove }) => {
  const { id, title, icon, isMinimized, isMaximized, zIndex, position, size, content } = windowState;
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Simple drag implementation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest('.window-controls')) return; // Don't drag if clicking controls
    
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    onFocus(id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onMove(id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onMove]);

  if (isMinimized) return null;

  const style: React.CSSProperties = isMaximized
    ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', zIndex }
    : { top: position.y, left: position.x, width: size.width, height: size.height, zIndex };

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col rounded-lg overflow-hidden shadow-2xl border border-white/30 transition-all duration-75 ${isDragging ? '' : 'transition-all'} ${isMaximized ? 'rounded-none' : ''}`}
      style={style}
      onMouseDown={() => onFocus(id)}
    >
      {/* Title Bar */}
      <div
        className="h-10 bg-slate-100/90 dark:bg-slate-800/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 select-none cursor-default"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => onMaximize(id)}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <i className={`${icon} text-blue-500`}></i>
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-2 window-controls">
          <button onClick={(e) => { e.stopPropagation(); onMinimize(id); }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
            <i className="fas fa-minus text-xs"></i>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMaximize(id); }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
            <i className={`far ${isMaximized ? 'fa-window-restore' : 'fa-square'} text-xs`}></i>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(id); }} className="w-8 h-8 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors group">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white dark:bg-[#1e1e1e] overflow-hidden relative">
        {content}
      </div>
    </div>
  );
};

export default Window;
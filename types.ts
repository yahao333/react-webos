import { ReactNode } from "react";

export enum AppID {
  TERMINAL = 'terminal',
  NOTEPAD = 'notepad',
  BROWSER = 'browser',
  PAINT = 'paint',
  CALCULATOR = 'calculator',
  VSCODE = 'vscode',
  VIDEO_EDITOR = 'video_editor',
  SETTINGS = 'settings',
  CAMERA = 'camera',
  GITHUB = 'github'
}

export interface WindowState {
  id: string;
  appId: AppID;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: ReactNode;
}

export interface AppConfig {
  id: AppID;
  name: string;
  icon: string; // FontAwesome class
  color: string;
  defaultSize: { width: number; height: number };
  component: React.FC<any>;
  externalUrl?: string;
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileSystemNode[];
}
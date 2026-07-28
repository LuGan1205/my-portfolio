export interface CharacterCard {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  description: string;
  personality: string;
  scenario: string;
  exampleDialogue: string;
  firstMessage: string;
  boundWorldBookIds: string[];
  tags: string[];
  unreadCount?: number;
  lastMessageTime?: number;
  lastMessageText?: string;
  isPinned?: boolean;
}

export type InsertionPosition = "before_sys" | "after_sys" | "depth";

export interface WorldEntry {
  id: string;
  title: string;
  keys: string[];
  content: string;
  enabled: boolean;
  position: InsertionPosition;
  depth?: number;
  matchCount: number;
}

export interface WorldBook {
  id: string;
  title: string;
  description: string;
  entries: WorldEntry[];
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  characterId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  imageUrl?: string;
  audioUrl?: string;
  isAudioPlaying?: boolean;
  activeLoreKeys?: string[];
}

export interface ApiConfig {
  source: "built-in" | "custom";
  customUrl: string;
  customKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface UserPersona {
  name: string;
  avatar: string;
  description: string;
}

export interface PhoneSettings {
  wallpaper: string;
  frameTheme: "rose_gold" | "creamy_milk" | "soft_lavender" | "dark" | "titanium" | "purple" | "gold" | "cyberpunk";
  soundEnabled: boolean;
  haptic: boolean;
  showStatusNotification: boolean;
  isLocked: boolean;
}

export type AppId = "home" | "social" | "worldbook" | "settings" | "studio" | "gallery" | "game";

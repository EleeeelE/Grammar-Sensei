
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  initialPrompt: string;
  category: string;
  // tasks property removed
}

export interface SuggestedReply {
  label: string;
  value: string;
}

export type FontSize = 'small' | 'normal' | 'large' | 'xl';

export enum ViewState {
  LANDING = 'LANDING',
  HOME = 'HOME',
  CATEGORY_DETAILS = 'CATEGORY_DETAILS',
  CHAT = 'CHAT',
  FAVORITES = 'FAVORITES',
  PROMO = 'PROMO'
}
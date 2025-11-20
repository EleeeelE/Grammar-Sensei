
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
}

export interface Note {
  id: string;
  lessonTitle: string;
  content: string;
  timestamp: number;
}

export interface SuggestedReply {
  label: string;
  value: string;
}

export enum ViewState {
  LANDING = 'LANDING',
  HOME = 'HOME', // Now acts as the Category List view
  CATEGORY_DETAILS = 'CATEGORY_DETAILS', // New view for listing lessons in a category
  CHAT = 'CHAT',
  NOTES = 'NOTES' // New view for listing user notes
}



export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  type?: 'chat';
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  initialPrompt: string;
  category: string;
  mode?: 'lesson' | 'roleplay';
  roleplayData?: {
    role: string;
    scenario: string;
    objective: string;
  };
  // tasks property removed
}

export interface SuggestedReply {
  label: string;
  value: string;
}

export interface NotebookEntry {
  id: string;
  text: string;
  timestamp: number;
  lessonTitle?: string;
}

export type FontSize = 'small' | 'normal' | 'large' | 'xl';

export type TeacherPersona = 'default' | 'toxic' | 'serious' | 'anime' | 'warm' | 'lazy' | 'roleplayer' | 'kansai';

export enum ViewState {
  LANDING = 'LANDING',
  HOME = 'HOME',
  CATEGORY_DETAILS = 'CATEGORY_DETAILS',
  CHAT = 'CHAT',
  FAVORITES = 'FAVORITES',
  PROMO = 'PROMO',
  NOTEBOOK = 'NOTEBOOK',
  VERB_TABLE = 'VERB_TABLE',
  KEIGO_TABLE = 'KEIGO_TABLE'
}

// Types for the new Dictionary View
export interface GrammarNode {
  part: string;
  role: string;
  children?: GrammarNode[];
}

export interface VocabularyItem {
  word: string;
  reading: string;
  type: string;
  meaning: string;
}

export interface ExplanationData {
  // FIX: Add 'UNKNOWN' to allow for error states or undetermined frequency, aligning it with the 'level' property's 'Unknown' state.
  frequency: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'Unknown';
  targetSentence: string;
  translation: string;
  context: string;
  grammarTree: {
    summary: string;
    tree: GrammarNode[];
  };
  vocabulary: VocabularyItem[];
  synonyms: string[];
}
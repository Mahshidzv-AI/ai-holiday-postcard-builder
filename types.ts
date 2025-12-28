export interface FormData {
  recipient: string;
  sender: string;
  holiday: string;
  vibe: string;
  theme: string;
  includeImage: boolean;
  customMessage?: string;
}

export type PostcardFont = 'Nunito' | 'Great Vibes' | 'Mountains of Christmas' | 'Dancing Script';

export interface PostcardData {
  recipient: string;
  sender: string;
  message: string;
  imageUrl?: string;
  holiday: string;
  font?: PostcardFont;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
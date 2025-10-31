
export type Module = 'dashboard' | 'text-analysis' | 'chat-assistant' | 'reading-practice' | 'dictionary-context';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

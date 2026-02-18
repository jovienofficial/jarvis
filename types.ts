
export type ThemeMode = 'default' | 'focus' | 'neon';

export interface GameState {
  score: number;
  isGameOver: boolean;
  highScore: number;
}

export interface HandData {
  isOpen: boolean;
  landmarks: any[];
}

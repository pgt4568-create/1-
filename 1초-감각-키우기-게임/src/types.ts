export enum GameState {
  READY = 'READY',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  GAME_OVER = 'GAME_OVER'
}

export interface RoundResult {
  round: number;
  targetTime: number;
  actualTime: number | null;
  score: number | null;
}

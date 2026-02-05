export interface CheerResponse {
  message: string;
  emoji: string;
}

export enum SoundType {
  CLAP = 'CLAP',
  DRUM = 'DRUM',
  CHEER = 'CHEER'
}

export interface FloatingItem {
  id: number;
  emoji: string;
  left: number;
  animationDuration: number;
}

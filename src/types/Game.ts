import { Document } from 'mongoose';
import { UserDoc } from './User';

export interface Game {
  title: string;
  imageURL: string;
  createdAt: number;
}

export type GameDoc = Document & Game;

export interface Play {
  game: GameDoc;
  user: UserDoc;
  score: number;
  createdAt: number;
}

export type PlayDoc = Document & Play;

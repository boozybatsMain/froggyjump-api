import { Document } from 'mongoose';
import { User } from './User';

export interface Game extends Document {
  title: string;
  imageURL: string;
  createdAt: number;
}

export interface Play extends Document {
  game: Game;
  user: User;
  score: number;
  createdAt: number;
}

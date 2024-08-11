import { Document } from 'mongoose';
import { User } from './User';

export interface Referral extends Document {
  user: User;
  joined: User;
  claimed: number;
  earned: number;
}

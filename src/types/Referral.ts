import { Document } from 'mongoose';
import { UserDoc } from './User';

export interface ReferralDoc extends Document {
  user: UserDoc;
  joined: UserDoc;
  claimed: number;
  earned: number;
  createdAt: number;
}

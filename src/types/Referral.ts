import { Document } from 'mongoose';
import { UserDoc, UserView } from './User';

export interface ReferralDoc extends Document {
  user: UserDoc;
  joined: UserDoc;
  claimed: number;
  earned: number;
  createdAt: number;
}

export interface ReferralsPagination {
  results: {
    user: UserView;
    earned: number;
    claimed: number;
    createdAt: number;
  }[];
  meta: {
    offset: number;
    limit: number;
    total: number;
  };
}

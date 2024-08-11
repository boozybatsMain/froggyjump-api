import mongoose, { FilterQuery, Types } from 'mongoose';
import { Referral } from '../../types/Referral';

const schema = new mongoose.Schema({
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  joined: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  claimed: {
    type: Number,
    default: 0,
    min: 0,
  },
  earned: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Number,
    default: Date.now,
  },
});

export const referralModel = mongoose.model<Referral>('Referral', schema);

export const createReferral = async (
  referral: FilterQuery<Referral>,
): Promise<Referral> => {
  return referralModel.create(referral);
};

export const getReferral = async (
  filter: FilterQuery<Referral>,
): Promise<Referral> => {
  const referral = await referralModel.findOne(filter);
  if (referral == null) {
    throw new Error('Referral not found');
  }

  return referral;
};

export const updateReferral = async (
  filter: FilterQuery<Referral>,
  data: FilterQuery<Referral>,
): Promise<void> => {
  await referralModel.findOneAndUpdate(filter, data);
};

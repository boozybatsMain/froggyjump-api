import mongoose, { FilterQuery, Types } from 'mongoose';
import { ReferralDoc } from '../../types/Referral';

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

export const referralModel = mongoose.model<ReferralDoc>('Referral', schema);

export const createReferral = async (
  referral: FilterQuery<ReferralDoc>,
): Promise<ReferralDoc> => {
  return referralModel.create(referral);
};

export const getReferrals = async (
  filter: FilterQuery<ReferralDoc>,
): Promise<ReferralDoc[]> => {
  return referralModel.find(filter);
};

export const getReferralsEarnedSum = async (
  filter: FilterQuery<ReferralDoc>,
): Promise<number> => {
  const result = await referralModel.aggregate<{
    total: number;
  }>([
    {
      $match: filter,
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$earned' },
      },
    },
  ]);

  return result[0]?.total ?? 0;
};

export const getReferral = async (
  filter: FilterQuery<ReferralDoc>,
): Promise<ReferralDoc> => {
  const referral = await referralModel.findOne(filter);
  if (referral == null) {
    throw new Error('Referral not found');
  }

  return referral;
};

export const getReferralsCount = async (
  filter: FilterQuery<ReferralDoc>,
): Promise<number> => {
  return referralModel.countDocuments(filter);
};

export const updateReferral = async (
  filter: FilterQuery<ReferralDoc>,
  data: FilterQuery<ReferralDoc>,
): Promise<void> => {
  await referralModel.findOneAndUpdate(filter, data);
};

export const updateReferrals = async (
  filter: FilterQuery<ReferralDoc>,
  data: FilterQuery<ReferralDoc>,
): Promise<void> => {
  await referralModel.updateMany(filter, data);
};

export const getReferralsInfo = async (
  userId: Types.ObjectId,
  offset?: number,
  limit?: number,
): Promise<ReferralDoc[]> => {
  return referralModel
    .find({
      user: userId,
    })
    .sort({
      createdAt: -1,
    })
    .skip(offset ?? 0)
    .limit(limit ?? 20)
    .populate('joined')
    .lean();
};

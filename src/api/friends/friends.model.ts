import mongoose, { FilterQuery, Types } from 'mongoose';
import { Friends } from 'types/Friends';
import { User } from 'types/User';

const schema = new mongoose.Schema({
  telegramIds: {
    required: true,
    type: [Number],
  },
  createdAt: {
    type: Number,
    default: Date.now,
  },
});

export const friendsModel = mongoose.model<Friends>('Friend', schema);

export const getUserFriends = async (
  telegramId: number,
  offset: number,
  count: number,
): Promise<{
  users: User[];
  total: number;
}> => {
  // @TODO aggregation splited with "faced" that takes "count" users by friends matches and their total count
  return {
    users: [],
    total: 0,
  };
};

export const getFriendsCount = async (telegramId: number): Promise<number> => {
  return friendsModel.countDocuments({
    telegramIds: {
      $in: [telegramId],
    },
  });
};

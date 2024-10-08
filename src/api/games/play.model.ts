import mongoose, { FilterQuery, PipelineStage, Types } from 'mongoose';
import { PlayDoc } from '../../types/Game';
import { UserDoc } from '../../types/User';
import { LEADERBOARD_LIMIT } from '../../utils/constants';

const schema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: true,
  },
  game: {
    required: true,
    type: Types.ObjectId,
    ref: 'Game',
  },
  user: {
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  },
  score: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Number,
    default: Date.now,
  },
});

export const playModel = mongoose.model<PlayDoc>('Play', schema);

export const createPlay = async (data: Partial<PlayDoc>): Promise<PlayDoc> => {
  return playModel.create(data);
};

export const updatePlay = async (
  filter: FilterQuery<PlayDoc>,
  data: FilterQuery<PlayDoc>,
): Promise<void> => {
  await playModel.findOneAndUpdate(filter, data);
};

export const getPlay = async (
  filter: FilterQuery<PlayDoc>,
): Promise<PlayDoc> => {
  const play = await playModel.findOne(filter);
  if (!play) {
    throw new Error('Play not found');
  }

  return play;
};

export const getUsersLeaderboard = async (
  gameId: Types.ObjectId,
  userId: Types.ObjectId,
): Promise<{
  leaderboard: {
    user: UserDoc;
    score: number;
    rank: number;
  }[];
  userRank: {
    user: UserDoc | null;
    score: number | null;
    rank: number | null;
  };
}> => {
  const userRankPipeline: PipelineStage[] = [
    {
      $match: {
        game: gameId,
      },
    },
    {
      $group: {
        _id: '$user',
        score: { $max: '$score' },
      },
    },
    {
      $sort: {
        score: -1,
      },
    },
    {
      $group: {
        _id: null,
        leaderboard: {
          $push: {
            userId: '$_id',
            score: '$score',
          },
        },
      },
    },
    {
      $unwind: {
        path: '$leaderboard',
        includeArrayIndex: 'leaderboard.rank',
      },
    },
    {
      $match: {
        'leaderboard.userId': userId,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'leaderboard.userId',
        foreignField: '_id',
        as: 'leaderboard.user',
      },
    },
    {
      $unwind: '$leaderboard.user',
    },
    {
      $project: {
        'leaderboard.rank': { $add: ['$leaderboard.rank', 1] },
        'leaderboard.user': 1,
        'leaderboard.score': 1,
      },
    },
  ];

  const userRankResult = await playModel.aggregate(userRankPipeline);
  const userRank =
    userRankResult.length > 0
      ? userRankResult[0].leaderboard
      : { user: null, score: null, rank: null };

  const leaderboardPipeline: PipelineStage[] = [
    {
      $match: {
        game: gameId,
      },
    },
    {
      $group: {
        _id: '$user',
        score: { $max: '$score' },
      },
    },
    {
      $sort: {
        score: -1,
      },
    },
    {
      $limit: LEADERBOARD_LIMIT,
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        _id: 0,
        user: 1,
        score: 1,
      },
    },
    {
      $addFields: {
        rank: { $add: [{ $indexOfArray: [[], '$_id'] }, 1] },
      },
    },
  ];

  const leaderboard = await playModel.aggregate(leaderboardPipeline);

  return {
    leaderboard,
    userRank,
  };
};

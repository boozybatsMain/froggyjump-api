import mongoose, { FilterQuery } from 'mongoose';
import { GameDoc } from '../../types/Game';

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    default: Date.now,
  },
});

export const gameModel = mongoose.model<GameDoc>('Game', schema);

export const getGame = async (
  filters: FilterQuery<GameDoc>,
): Promise<GameDoc> => {
  const game = await gameModel.findOne(filters);
  if (game == null) {
    throw new Error('Game not found');
  }

  return game;
};

export const getGames = async (
  filters: FilterQuery<GameDoc>,
): Promise<GameDoc[]> => {
  return gameModel.find(filters);
};

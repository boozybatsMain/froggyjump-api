import mongoose, { FilterQuery } from 'mongoose';
import { Game } from '../../types/Game';

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

export const gameModel = mongoose.model<Game>('Game', schema);

export const getGame = async (filters: FilterQuery<Game>): Promise<Game> => {
  const game = await gameModel.findOne(filters);
  if (game == null) {
    throw new Error('Game not found');
  }

  return game;
};

export const getGames = async (filters: FilterQuery<Game>): Promise<Game[]> => {
  return gameModel.find(filters);
};

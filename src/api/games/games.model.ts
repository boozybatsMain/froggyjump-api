import mongoose, { FilterQuery } from 'mongoose';
import { Game } from 'types/Game';

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

export const getGames = async (filters: FilterQuery<Game>) => {
  return gameModel.find(filters);
};

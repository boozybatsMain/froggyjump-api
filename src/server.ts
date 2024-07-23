import { app } from './app';
import mongoose from 'mongoose';
import { config } from './config';

mongoose
  .connect('...')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

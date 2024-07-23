import express, { Application, Request, Response } from 'express';

export const app: Application = express();

app.use(express.json());
app.use('/api');

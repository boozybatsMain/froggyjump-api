import TelegramBot from 'node-telegram-bot-api';
import { getUsers, updateUsers } from '../api/users/users.model';
import { info } from './logger';

const logCateogry = 'telegram.ts';

export const initializeTelegramBot = ({
  token,
  twaUrl,
}: {
  token: string;
  twaUrl: string;
}) => {
  const bot = new TelegramBot(token, { polling: true });

  info(logCateogry, 'Telegram bot is running');

  const messageOptions: TelegramBot.SendMessageOptions = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Open Game',
            url: twaUrl,
            // web_app: {
            //   url: twaUrl,
            // },
          },
        ],
      ],
    },
  };

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(
      chatId,
      'Welcome to the game! Click the button below to start playing.',
      messageOptions,
    );
  });

  const notifyInactiveUsers = async () => {
    const now = Date.now();
    const twoDaysInMs = 100; // 2 * 24 * 60 * 60 * 1000;

    const filter = {
      lastVisit: { $lt: now - twoDaysInMs },
      lastNotification: { $lt: now - twoDaysInMs },
    };

    const users = await getUsers(filter);

    users.forEach(async (user) => {
      const chatId = user.telegramId;

      bot.sendMessage(
        chatId,
        'Hey, it looks like you haven’t played the game for a while. Come back and join the fun!',
        messageOptions,
      );
    });

    await updateUsers(filter, { lastNotification: now });
  };

  setInterval(notifyInactiveUsers, 10 * 60 * 1000);
};

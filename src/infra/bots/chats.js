import chalk from 'chalk';
import fetch from 'node-fetch';
import ChatsRepository from '../../repositories/chats.js';
import MessagesRepository from '../../repositories/messages.js';
import UsersRepository from '../../repositories/users.js';
import ChatsService from '../../services/chats.js';
import MessagesService from '../../services/messages.js';

import { execute, getArgument, log } from '../../utils.js';

import '../mongoose/connection.js';

const init = () => {
  const token = getArgument('token');
  if (!token) {
    console.error(chalk.red('> err: no token provided. Use --token argument.'));
    process.exit(1);
  }

  log('fetching live chat archives');

  const command = `curl --request POST \
    --url https://api.livechatinc.com/v3.3/agent/action/list_archives \
    --header 'Authorization: Bearer ${token}' \
    --header 'Content-Type: application/json' \
    --data '{
        "limit": 1
    }'`;

  const output = execute(command, async (err, response) => {
    if (!!err) {
      console.error(chalk.red('> err:'), err);
      process.exit(1);
    }

    const { chats, next_page_id } = response;

    if (chats.length) {
      const chatsRepository = new ChatsRepository();
      const messagesRepository = new MessagesRepository();
      const usersRepository = new UsersRepository();
      const chatsService = new ChatsService(chatsRepository, usersRepository);
      const messagesService = new MessagesService(messagesRepository);

      log(`found ${chats.length} chats`);
      await Promise.all(
        chats.map(async chat => {
          const mappedChat = await chatsService.add(chat);
          if (mappedChat) {
            if (!chat.thread?.events?.length) {
              log('chat without messages. Moving to next');
            } else {
              log('adding messages');
              await messagesService.add({
                chat: mappedChat,
                messages: chat.thread.events
              });
            }
          }
        })
      );
    }

    log('no archives found');
    process.exit();
  });
};

init();

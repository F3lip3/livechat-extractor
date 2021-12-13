import chalk from 'chalk';
import fetch from 'node-fetch';
import ChatsService from '../../services/chats.js';

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
      const chatsService = new ChatsService();

      log(`found ${chats.length} chats`);
      await Promise.all(
        chats.map(async chat => {
          const mappedChat = await chatsService.add(chat);
          if (mappedChat) {
            // add messages to chatd
          }
        });
      )
    }

    log('no archives found');
    process.exit();
  });
};

init();

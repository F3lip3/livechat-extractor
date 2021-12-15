import chalk from 'chalk';
import fetch from 'node-fetch';
import ChatsRepository from '../../repositories/chats.js';
import MessagesRepository from '../../repositories/messages.js';
import UsersRepository from '../../repositories/users.js';
import ChatsService from '../../services/chats.js';
import MessagesService from '../../services/messages.js';
import PagesService from '../../services/pages.js';

import { execute, getArgument, log, info } from '../../utils.js';

import '../mongoose/connection.js';

const init = async () => {
  const token = getArgument('token');
  if (!token) {
    console.error(chalk.red('> err: no token provided. Use --token argument.'));
    process.exit(1);
  }

  const pagesService = new PagesService();
  const nextPage = await pagesService.find('chat');

  let filters = { limit: 100 };
  if (nextPage) {
    filters = { page_id: nextPage.next_page_id };
  }

  const command = `curl --request POST \
    --url https://api.livechatinc.com/v3.3/agent/action/list_archives \
    --header 'Authorization: Bearer ${token}' \
    --header 'Content-Type: application/json' \
    --data '${JSON.stringify(filters)}'`;

  const output = execute(command, async (err, response) => {
    if (!!err) {
      console.error(chalk.red('> err:'), err);
      process.exit(1);
    }

    const { chats, found_chats, next_page_id, error } = response;
    if (error) {
      log(error.message, 'error');
      process.exit(1);
    }

    if (!chats?.length) {
      log('no archives found', 'info');
      process.exit();
    }

    const chatsRepository = new ChatsRepository();
    const messagesRepository = new MessagesRepository();
    const usersRepository = new UsersRepository();
    const chatsService = new ChatsService(chatsRepository, usersRepository);
    const messagesService = new MessagesService(messagesRepository);

    if (!info.total) info.total = +found_chats;
    if (!info.processed) info.processed = await chatsRepository.getTotalChats();

    log(`found ${chats.length} chats`, 'info');
    const result = await Promise.all(
      chats.map(async chat => {
        const mappedChat = await chatsService.add(chat);
        if (mappedChat) {
          if (!chat.thread?.events?.length) {
            log('chat without messages. Moving to next', 'info');
            return false;
          } else {
            log('adding messages');
            const messagesResult = await messagesService.add({
              chat: mappedChat,
              messages: chat.thread.events
            });

            return messagesResult;
          }
        }
        return false;
      })
    );

    const addedChats = result.filter(x => !!x);

    info.processed += addedChats.length;

    log(
      `added ${addedChats.length} chats`,
      addedChats.length ? 'success' : 'warn'
    );

    if (!next_page_id) {
      log('process finished', 'info');
      process.exit();
    }

    log('fetching next page', 'info');
    await pagesService.add({ object: 'chat', next_page_id });
    await init();
  });
};

await init();

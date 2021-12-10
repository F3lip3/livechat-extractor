import chalk from 'chalk';
import fetch from 'node-fetch';
import Chat from '../../schemas/Chat.js';
import Group from '../../schemas/Group.js';
import UsersService from '../../services/users.js';
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
      log(`found ${chats.length} chats`);
      const uniqueChats = await asyncFilter(chats, async chat => {
        const exists = await chatExists({
          chat_id: chat.id,
          thread_id: chat.thread?.id
        });

        return !exists;
      });

      if (!uniqueChats?.length) {
        log('all chats already exists');
        process.exit();
      }

      const allGroups = await Group.find({});

      await Promise.all(
        uniqueChats.map(async chat => {
          log('adding users');
          const users = await addUsers(chat.users);
          log('setting group');
          const groupId = chat.thread?.access?.group_ids?.length
            ? chat.thread.access.group_ids[0]
            : 0;
          const group = allGroups.find(grp => grp.id === groupId);
          // add chat to database
          // add chat to mongo
          // add messages to chatd


          const chatData = {
            chat_id: chat.id,
            thread_id: chat.thread.id,
            conversation_id: 0
          };
        });
      )
    }

    log('no archives found');
    process.exit();
  });
};

const addUsers = async users => {
  const mappedUsers = await Promise.all(
    users.map(async user => {
      const { id, type, account_user_id } = await UsersService.add(user);

      return {
        id,
        type,
        account_user_id
      };
    })
  )
};

const chatExists = async ({ chat_id, thread_id }) => {
  const exists = await Chat.exists({
    chat_id,
    thread_id
  });

  return exists;
};

init();

import Chat from '../schemas/Chat.js';
import Group from '../schemas/Group.js';
import UsersService from '../services/users.js';
import { log } from '../utils.js';

export default class ChatsService {
  private allGroups = [];
  private usersService;

  constructor(private chatsRepository, private usersRepository) {
    this.usersService = new UsersService(usersRepository);
  }

  public add = async chat => {
    if (!chat.thread?.id) {
      log('cancelling add chat action because it has no thread');
      return undefined;
    }

    if (!chat.users?.length) {
      log('cancelling add chat action because it has no users');
      return undefined;
    }

    const existingChat = await this.find({
      chat_id: chat.id,
      thread_id: chat.thread.id
    });

    if (existingChat) {
      log('chat already exists');
      return existingChat;
    }

    log('adding or finding users');
    const users = await addUsers(chat.users);

    log('setting customer id');
    const customer = users.find(user => user.type === 'customer');

    if (!customer) {
      log('cancelling add chat action because it has no customer');
      return undefined;
    }

    log('setting group');
    const group = await this.findGroup(
      chat.thread?.access?.group_ids,
      allGroups
    );

    log('adding chat to database');
    const { id: conversation_id } = await this.chatsRepository.findOrInsert({
      externalId: chat.thread.id,
      userId: customer.account_user_id,
      groupId: group?.account_group_id
    });

    log('saving chat');
    const newChat = await Chat.create({
      chat_id: chat.id,
      thread_id: chat.thread.id,
      conversation_id,
      users,
      group
    });

    log('chat created', 'success');
    return newChat;
  };

  private addUsers = async users => {
    const mappedUsers = await Promise.all(
      users.map(async user => {
        const { id, type, account_user_id } = await this.usersService.add(user);

        return {
          id,
          type,
          account_user_id
        };
      })
    );

    return mappedUsers;
  };

  private find = async ({ chat_id, thread_id }) => {
    const existingChat = await Chat.exists({
      chat_id,
      thread_id
    });

    return existingChat;
  };

  private findGroup = async (groupIds, allGroups) => {
    if (!groupdIds?.length) return undefined;
    if (!this.allGroups.length) {
      this.allGroups = await Group.find({});
    }

    return this.allGroups.find(grp => grp.id === groupId);
  };
}

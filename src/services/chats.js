import Chat from '../schemas/Chat.js';
import Group from '../schemas/Group.js';
import UsersService from '../services/users.js';
import { log } from '../utils.js';

export default class ChatsService {
  _allGroups = [];
  _chatsRepository;
  _usersService;

  constructor(_chatsRepository, _usersRepository) {
    this._chatsRepository = _chatsRepository;
    this._usersService = new UsersService(_usersRepository);
  }

  add = async chat => {
    if (!chat.thread?.id) {
      log('cancelling add chat action because it has no thread');
      return undefined;
    }

    if (!chat.users?.length) {
      log('cancelling add chat action because it has no users');
      return undefined;
    }

    const existingChat = await this._find({
      id: chat.id,
      thread_id: chat.thread.id
    });

    if (existingChat) {
      log('chat already exists');
      return existingChat;
    }

    log('adding or finding users');
    const users = await this._addUsers(chat.users);

    log('setting customer id');
    const customer = users.find(user => user?.type === 'customer');

    if (!customer) {
      log('cancelling add chat action because it has no customer');
      return undefined;
    }

    log('setting group');
    const group = await this._findGroup(chat.thread?.access?.group_ids);

    log('adding chat to database');
    const { id: conversation_id } = await this._chatsRepository.findOrInsert({
      externalId: chat.thread.id,
      userId: customer.account_user_id,
      groupId: group?.account_group_id
    });

    log('saving chat');
    const newChat = await Chat.create({
      id: chat.id,
      thread_id: chat.thread.id,
      conversation_id,
      users,
      group
    });

    log('chat created');
    return newChat;
  };

  _addUsers = async users => {
    const mappedUsers = await Promise.all(
      users.map(async user => {
        const newUser = await this._usersService.add(user);

        return newUser;
      })
    );

    return mappedUsers;
  };

  _find = async ({ id, thread_id }) => {
    const existingChat = await Chat.findOne({
      id,
      thread_id
    }).populate('users');

    return existingChat;
  };

  _findGroup = async groupIds => {
    if (!groupIds?.length) return undefined;
    if (!this._allGroups.length) {
      this._allGroups = await Group.find({});
    }

    return this._allGroups.find(grp => grp.id === groupIds[0]);
  };
}

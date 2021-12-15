import Message from '../schemas/Message.js';
import { asyncFilter, log } from '../utils.js';

export default class MessagesService {
  _messagesRepository;

  constructor(_messagesRepository) {
    this._messagesRepository = _messagesRepository;
  }

  add = async ({ chat, messages }) => {
    const mappedMessages = messages.filter(message => !!message.text);
    if (!mappedMessages.length) {
      log('no messages found');
      return false;
    }

    log('checking existing messages');
    const newMessages = await asyncFilter(mappedMessages, async message => {
      const exists = await this._find({ id: message.id });
      return !exists;
    });

    if (!newMessages.length) {
      log('all messages already exists');
      return false;
    }

    log('building messages batch');
    const messagesBatch = newMessages.map(message => {
      const user = this._findUser({
        users: chat.users,
        userId: message.author_id
      });

      return {
        id: message.id,
        chatId: chat.conversation_id,
        userId: user?.account_user_id,
        text: message.text,
        type: message.type,
        userType: user?.type,
        createdAt: message.created_at
      };
    });

    log('bulk adding messages', 'info');
    const addedMessages = await this._messagesRepository.bulkInsert(
      messagesBatch
    );

    await Message.create(
      messagesBatch.filter(this._uniqueMessages).map(message => ({
        id: message.id,
        chat
      }))
    );

    log(`${addedMessages} messages created`, 'success');
    return true;
  };

  _find = async ({ id }) => {
    const existingMessage = await Message.findOne({ id });

    return existingMessage;
  };

  _findUser = ({ users, userId }) => {
    const user = users.find(user => user.id === userId);

    return user;
  };

  _uniqueMessages = (message, index, messages) => {
    return messages.findIndex(item => item.id === message.id) === index;
  };
}

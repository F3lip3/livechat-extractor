import Message from '../schemas/Message.js';

export default class MessagesService {
  _messagesRepository;

  constructor(_messagesRepository) {
    this._messagesRepository = _messagesRepository;
  }

  add = async ({ chat, message }) => {
    if (!message.text) {
      log('ignoring message without text');
      return undefined;
    }

    log('adding message');
    const existingMessage = await this._find({ id: message.id });
    if (existingMessage) {
      log('message already exists');
      return existingMessage;
    }

    log('finding author');
    const user = this._findUser({
      users: chat.users,
      userId: message.author_id
    });

    if (!user) {
      log('unable to find author', 'error');
      return undefined;
    }

    log('adding new message');

    const { id: message_id } = await this._messagesRepository.findOrInsert({
      id: message.id,
      chatId: chat.conversation_id
      userId: user.account_user_id,
      text: message.text,
      type: message.type,
      userType: user.type,
      createdAt: message.created_at
    });

    const newMessage = await Message.create({
      id: message.id,
      chat,
      message_id
    });

    log('message created', 'success');
    return newMessage;
  };

  _find = async ({ id }) => {
    const existingMessage = await Message.findOne({ id });

    return existingMessage;
  };

  _findUser = ({ users, userId }) => {
    const user = users.find(user => user.id === userId);

    return user;
  };
}

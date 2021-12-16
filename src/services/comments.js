import { v4 as uuid } from 'uuid';

import Comment from '../schemas/Comment.js';
import UsersService from '../services/users.js';
import { asyncFilter, log } from '../utils.js';

export default class CommentsService {
  _commentsRepository;
  _usersService;
  _users = [];

  constructor(_commentsRepository, _usersRepository) {
    this._commentsRepository = _commentsRepository;
    this._usersService = new UsersService(_usersRepository);
  }

  add = async ({ ticketId, comments }) => {
    const validComments = comments.filter(comment =>
      ['attachments', 'message'].includes(comment.type)
    );

    if (!validComments.length) {
      log('no valid comments found', 'warn');
      return false;
    }

    const mappedComments = validComments.filter(
      comment =>
        (comment.type === 'message' && comment.message?.text) ||
        (comment.type === 'attachments' && comment.attachments?.files?.length)
    );

    if (!mappedComments.length) {
      log('all mapped comments have insufficient data', 'warn');
      return false;
    }

    log('checking existing comments', 'info');
    const newComments = await asyncFilter(mappedComments, async comment => {
      const exists = await this._find({ id: comment['ID'], ticketId });
      return !exists;
    });

    if (!newComments) {
      log('all comments already exists');
      return false;
    }

    log('building comments batch');
    const commentsBatch = await Promise.all(
      newComments.map(async comment => {
        const user = this._findUser({
          id: uuid(),
          email: comment.author?.email ?? comment.author?.name ?? uuid(),
          name: comment.author?.name ?? uuid(),
          type: comment.author?.type ?? 'agent'
        });

        return {
          userId: user.account_user_id,
          ticketId,
          text:
            comment.type === 'message'
              ? this._formatValue(comment.message?.text ?? '')
              : this._formatAttachments(comment.attachments?.files),
          createdAt: comment.date
        };
      })
    );

    log('bulking add comments');
    const addedComments = await this._commentsRepository.bulkInsert(
      commentsBatch
    );

    await Comment.create(
      commentsBatch.filter(this._uniqueComments).map(comment => ({
        id: comment['ID'],
        ticketId
      }))
    );

    log(`${addedComments} comments created for ticket ${ticketId}`, 'success');
    return true;
  };

  _find = async ({ id, ticketId }) => {
    const existingComment = await Comment.findOne({ id, ticketId });

    return existingComment;
  };

  _findUser = userData => {
    const existingUser = this._users.find(usr => usr.email === userData.email);
    if (existingUser) {
      return existingUser;
    }

    const user = await this._usersService.add(userData);
    if (user) {
      this._users.push(user);
    }

    return user;
  };

  _formatAttachments = files => {
    if (!files?.length) return '';

    return (
      '<b>Anexos:</b><br />' +
      files.map(file => `<a href="${file.url}">${file.name}</a>`).join('<br>')
    );
  };

  _formatValue = value => {
    return value.replace(/\n/g, '<br>');
  };

  _uniqueComments = (comment, index, comments) => {
    return comments.findIndex(item => item.id === comment.id) === index;
  };
}

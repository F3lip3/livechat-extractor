import User from '../schemas/User.js';
import UsersRepository from '../repositories/users.js';
import { log, truncate } from '../utils.js';

export default class UsersService {
  _usersRepository;

  constructor(_usersRepository) {
    this._usersRepository = _usersRepository;
  }

  add = async user => {
    log(`adding user ${user.email ?? user.name ?? user.id}`);

    const existingUser = await this._find(user.email, user.name, user.id);
    if (existingUser) {
      log(`user ${user.email ?? user.name ?? user.id} already exists`);
      return existingUser;
    }

    const { user_id, account_user_id } =
      await this._usersRepository.findOrInsert(user);

    const newUserData = {
      id: user.id,
      name: truncate(user.name?.trim() || user.id, 150),
      email: truncate(user.email?.trim() || user.id, 150),
      type: user.type,
      user_id,
      account_user_id
    };

    try {
      const newUser = await User.create(newUserData);
      log(`user ${user.email ?? user.name} created`);
      return newUser;
    } catch (err) {
      if (err.message.includes('duplicate key error')) {
        const dupUser = await this._findByUser(user_id, account_user_id);
        if (dupUser) {
          log(`user ${user.email ?? user.id} already exists`, 'trace', dupUser);
          return dupUser;
        }
      }

      log(`failed to add user - ${err.message}`, 'error', newUserData);
      process.exit(1);
    }
  };

  _find = async (email, name, id) => {
    if (email) {
      const existingUser = await User.findOne({ email });
      return existingUser;
    }

    if (name) {
      const existingUser = await User.findOne({ name });
      return existingUser;
    }

    if (id) {
      const existingUser = await User.findOne({ id });
      return existingUser;
    }

    return undefined;
  };

  _findByUser = async (user_id, account_user_id) => {
    let existingUser;

    if (user_id) {
      existingUser = await User.findOne({ user_id });
    }

    if (account_user_id && !existingUser) {
      existingUser = await User.findOne({ account_user_id });
    }

    return existingUser;
  };
}

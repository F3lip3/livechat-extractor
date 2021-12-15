import User from '../schemas/User.js';
import UsersRepository from '../repositories/users.js';
import { log } from '../utils.js';

export default class UsersService {
  _usersRepository;

  constructor(_usersRepository) {
    this._usersRepository = _usersRepository;
  }

  add = async user => {
    if (!user.email) {
      log('cancelling add user action because it has no email', 'warning');
      return undefined;
    }

    log(`adding user ${user.email}`);

    const existingUser = await this._find(user.email);
    if (existingUser) {
      log(`user already exists`);
      return existingUser;
    }

    const { user_id, account_user_id } =
      await this._usersRepository.findOrInsert(user);

    let newUser;

    try {
      newUser = await User.create({
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        user_id,
        account_user_id
      });
    } catch (err) {
      if (err.message.includes('duplicate key error')) {
        newUser = await this._find(user.email);
      }
    }

    log('user created');
    return newUser;
  };

  _find = async email => {
    const existingUser = await User.findOne({ email });

    return existingUser;
  };
}

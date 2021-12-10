import User from '../schemas/User.js';
import UsersRepository from '../repositories/users.js';
import { log } from '../utils.js';

export default class UsersService {
  static add = async user => {
    if (!user.email) {
      log('cancelling add user action because it has no email');
      return undefined;
    }

    log(`adding user ${user.email}`);

    const existingUser = await UsersService.find(user.email);
    if (existingUser) {
      log(`user already exists`);
      return existingUser;
    }

    const { user_id, account_user_id } = await UsersRepository.findOrInsert(
      user
    );

    const newUser = await User.create({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      user_id,
      account_user_id
    });

    log('user created', 'success');
    return newUser;
  };

  static find = async email => {
    const existingUser = await User.findOne({ email });

    return existingUser;
  };
}

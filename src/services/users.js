import User from '../schemas/User.js';
import UsersRepository from '../repositories/users.js';
import { log } from '../utils.js';

export const add = async user => {
  if (!user.email) {
    log('cancelling add user action because it has no email');
    return undefined;
  }

  log(`adding user ${user.email}`);

  const existingUser = await find(user.email);
  if (existingUser) {
    log(`user already exists`);
    return existingUser;
  }

  const { user_id, account_user_id } = await UsersRepository.findOrInsert(user);

  const newUser = await User.create({
    id: user.id,
    name: user.name,
    email: user.email,
    user_id,
    account_user_id
  });

  log('user created', 'success');
  return newUser;
};

const find = async email => {
  const existingUser = await User.findOne({ email });

  return existingUser;
};

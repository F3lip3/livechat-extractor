import { query } from '../infra/mssql/database.js';
import { log } from '../utils.js';

export default class UsersRepository {
  findOrInsert = async user => {
    const filter =
      user.email || user.name
        ? `${user.email ? 'email = @email' : 'name = @name'}`
        : 'email = @email';

    const existingUser = await query(
      `
      SELECT TOP 1
        [user].id,
        [accountUser].id as [accountUserId]
      FROM [user] WITH(NOLOCK)
      LEFT JOIN [accountUser]
        ON [user].id = [accountUser].userId
      AND [accountUser].accountId = 6
      WHERE ${filter}`,
      { email: user.email ?? user.id, name: user.name }
    );

    if (existingUser) {
      let { id: user_id, accountUserId: account_user_id } = existingUser;
      if (!account_user_id) {
        const accountUser = await this._linkUserToAccount(user_id, false);
        account_user_id = accountUser.id;
      }

      return {
        user_id,
        account_user_id
      };
    }

    const newUser = await query(
      `
      INSERT INTO [user] ([roleId], [name], [email], [isActive], [createdAt], [updatedAt])
      OUTPUT inserted.id
      VALUES (0, @name, @email, 1, GETDATE(), GETDATE())
    `,
      { name: user.name, email: user.email ?? user.id }
    );

    const accountUser = await this._linkUserToAccount(newUser.id, true);

    return {
      user_id: newUser.id,
      account_user_id: accountUser.id
    };
  };

  _linkUserToAccount = async (userId, isNew) => {
    log(
      isNew
        ? `linking new user ${userId} to account 6`
        : `linking existing user ${userId} to account 6`
    );

    const newAccountUser = await query(
      `
      INSERT INTO [accountUser]([accountId], [userId], [externalId], [createdAt])
      OUTPUT inserted.id
      VALUES (6, @userId, NEWID(), GETDATE())`,
      { userId }
    );

    return newAccountUser;
  };
}

import { query } from '../infra/mssql/database.js';

export default class ChatsRepository {
  public findOrInsert = async chat => {
    const existingChat = await query(
      `
      SELECT [chat].id
      FROM [chatConversation] as [chat] WITH(NOLOCK)
      WHERE [externalId] = @externalId`,
      { externalId: chat.externalId }
    );

    if (existingChat) {
      return {
        id: existingChat.id
      };
    }

    const newChat = await query(
      `
      INSERT INTO [chatConversation](
        [externalId],
        [accountId],
        [accountUserRequesterId],
        [assignedAccountGroupId],
        [status],
        [createdAt])
      OUTPUT inserted.id
      VALUES (@externalId, 6, @userId, @groupId, 'resolved', GETDATE())`,
      {
        externalId: chat.externalId,
        userId: chat.userId,
        groupId: chat.groupId
      }
    );

    return {
      id: newChat.id
    };
  };
}

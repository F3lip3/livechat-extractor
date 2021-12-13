export default class MessagesRepository {
  findOrInsert = async ({
    id,
    chatId,
    userId,
    text,
    type,
    userType,
    createdAt
  }) => {
    const existingMessage = await query(
      `
      SELECT [id]
      FROM [chatConversationMessage] WITH(NOLOCK)
      WHERE [externalId] = @externalId`,
      { externalId: id }
    );

    if (existingMessage) {
      return {
        id: existingMessage.id
      };
    }

    const newMessage = await query(
      `INSERT INTO [chatConversationMessage](
        [externalId],
        [chatConversationId],
        [accountUserActorId],
        [message],
        [messageType],
        [actorType],
        [createdAt])
      OUTPUT inserted.id
      VALUES (
        @externalId,
        @chatId,
        @userId,
        @message,
        @messageType,
        @userType,
        @createdAt)`,
      {
        externalId: id,
        chatId,
        userId,
        message,
        messageType,
        userType,
        createdAt
      }
    );

    return {
      id: newMessage.id
    };
  };
}

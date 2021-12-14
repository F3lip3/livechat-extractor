import mssql from 'mssql';
import { bulk } from '../infra/mssql/database.js';

export default class MessagesRepository {
  bulkInsert = async messages => {
    const table = new mssql.Table('chatConversationMessage');

    table.columns.add('externalId', mssql.NVarChar(200), { nullable: false });
    table.columns.add('chatConversationId', mssql.BigInt, { nullable: false });
    table.columns.add('accountUserActorId', mssql.BigInt, { nullable: true });
    table.columns.add('message', mssql.NVarChar(mssql.MAX), { nullable: true });
    table.columns.add('messageType', mssql.NVarChar(200), { nullable: true });
    table.columns.add('actorType', mssql.NVarChar(200), { nullable: true });
    table.columns.add('createdAt', mssql.DateTime, { nullable: true });

    messages.map(({ id, chatId, userId, text, type, userType, createdAt }) => {
      table.rows.add(
        id,
        chatId,
        userId,
        text,
        type,
        userType,
        new Date(createdAt)
      );
    });

    const result = await bulk(table);

    return result;
  };
}

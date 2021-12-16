import mssql from 'mssql';
import { bulk } from '../infra/mssql/database.js';

export default class CommentsRepository {
  bulkInsert = async comments => {
    const table = new mssql.Table('ticketComment');

    table.columns.add('accountUserAuthorId', mssql.BigInt, { nullable: false });
    table.columns.add('ticketId', mssql.BigInt, { nullable: false });
    table.columns.add('value', mssql.VarChar(mssql.MAX), { nullable: false });
    table.columns.add('isPublic', mssql.Bit, { nullable: false });
    table.columns.add('createdAt', mssql.DateTime, { nullable: false });

    comments.map(({ userId, ticketId, text, createdAt }) => {
      table.rows.add(userId, ticketId, text, 1, new Date(createdAt));
    });

    const result = await bulk(table);

    return result;
  };
}

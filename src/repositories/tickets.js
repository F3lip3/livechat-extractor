import { query } from '../infra/mssql/database.js';

export default class TicketsRepository {
  findOrInsert = async ticket => {
    const existingTicket = await query(
      `SELECT TOP 1 [ticket].id
      FROM [ticket] WITH(NOLOCK)
      WHERE [externalId] = @externalId`,
      { externalId: ticket.externalId }
    );

    if (existingTicket) {
      return {
        id: existingTicket.id
      };
    }

    const newTicket = await query(
      `INSERT INTO [ticket] (
        [accountId],
        [externalId],
        [accountUserRequesterId],
        [accountUserSubmitterId],
        [accountUserAssigneeId],
        [accountGroupId],
        [statusId],
        [priorityId],
        [ticketTypeId],
        [subject],
        [isPublic],
        [createdAt],
        [solvedAt]
      )
      OUTPUT inserted.id
      VALUES (6, @externalId, @userId, @userId, 553798, @groupId, 4, 0, 2,
              @subject, 1, @createdAt, @solvedAt)`,
      {
        externalId: ticket.externalId,
        userId: ticket.userId,
        groupId: ticket.groupId,
        subject: ticket.subject,
        createdAt: ticket.createdAt,
        solvedAt: ticket.solvedAt
      }
    );

    return {
      id: newTicket.id
    };
  };

  getTotalTickets = async () => {
    const result = await query(
      `
      SELECT COUNT(*) as [total]
      FROM [ticket] WITH(NOLOCK)
      WHERE [accountId] = 6;`
    );

    return result.total;
  };
}

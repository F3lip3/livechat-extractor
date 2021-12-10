import { query } from '../infra/mssql/database.js';

export default class GroupsRepository {
  static findOrInsert = async group => {
    const existingGroup = await query(
      `
      SELECT [group].id,
             [group].name,
             [group].isActive,
             [accountGroup].id as [accountGroupId]
      FROM [group] WITH(NOLOCK)
      LEFT JOIN [accountGroup]
        ON [group].id = [accountGroup].groupId
       AND [accountGroup].accountId = 6
      WHERE name = @name`,
      { name: group.name }
    );

    if (existingGroup) {
      if (!existingGroup.isActive) {
        await query('UPDATE [group] SET isActive = 1 WHERE id = @id', {
          id: existingGroup.id
        });
      }

      let { id: group_id, accountGroupId: account_group_id } = existingGroup;
      if (!account_group_id) {
        const accountGroup = await GroupsRepository.linkGroupToAccount(
          group_id
        );

        account_group_id = accountGroup.id;
      }

      return {
        group_id,
        account_group_id
      };
    }

    const newGroup = await query(
      `
      INSERT INTO [group]([name], [isActive], [createdAt], [updatedAt])
      OUTPUT inserted.id
      VALUES (@name, 1, GETDATE(), GETDATE())`,
      { name: group.name }
    );

    const accountGroup = await GroupsRepository.linkGroupToAccount(newGroup.id);

    return {
      group_id: newGroup.id,
      account_group_id: accountGroup.id
    };
  };

  static linkGroupToAccount = async groupId => {
    const newAccountGroup = await query(
      `
      INSERT INTO [accountGroup]([accountId], [groupId], [externalId], [createdAt])
      OUTPUT inserted.id
      VALUES (6, @groupId, NEWID(), GETDATE())`,
      { groupId }
    );

    return newAccountGroup;
  };
}

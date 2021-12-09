import fetch from 'node-fetch';
import Group from '../schemas/Group.js';
import { asyncFilter, execute, getArgument, log, paths } from '../utils.js';

import '../infra/mongoose/connection.js';
import { query } from '../infra/mssql/database.js';

const init = () => {
  const token = getArgument('token');
  if (!token) {
    log('no token provided. Use --token argument.', 'error');
    process.exit(1);
  }

  log('fetching live chat groups');

  const command = `curl --request POST \
    --url ${paths.base_url}/configuration/action/list_groups \
    --header 'Authorization: Bearer ${token}' \
    --header 'Content-Type: application/json' \
    --data '{}'`;

  execute(command, async (err, groups) => {
    if (!!err) {
      console.error(chalk.red('> err:'), err);
      process.exit(1);
    }

    if (groups.length) {
      log(`found ${groups.length} groups`);
      const uniqueGroups = await asyncFilter(groups, async group => {
        const exists = await groupExists(group.name);
        return !exists;
      });

      if (!uniqueGroups?.length) {
        log('all found groups already exists');
        process.exit();
      }

      const groupsData = await Promise.all(
        uniqueGroups.map(async group => {
          const groupId = await findOrInsertGroup(group);

          return {
            id: group.id,
            name: group.name,
            hc_id: groupId
          };
        })
      );

      const createdGroups = await Group.create(groupsData);

      log(`${createdGroups.length} groups created`, 'success');
      process.exit();
    }

    log('no groups found');
    process.exit();
  });
};

const groupExists = async name => {
  const exists = await Group.exists({
    name
  });

  return exists;
};

const findOrInsertGroup = async group => {
  const existingGroup = await query(
    `
    SELECT id, name, isActive FROM [group] WITH(NOLOCK)
    WHERE name = @name`,
    { name: group.name }
  );

  if (existingGroup?.isActive) {
    return existingGroup.id;
  }

  if (existingGroup && !existingGroup.isActive) {
    await query('UPDATE [group] SET isActive = 1 WHERE id = @id', {
      id: existingGroup.id
    });

    return existingGroup.id;
  }

  const newGroup = await query(
    `
    INSERT INTO [group]([name], [isActive], [createdAt], [updatedAt])
    OUTPUT inserted.id
    VALUES (@name, 1, GETDATE(), GETDATE())`,
    { name: group.name }
  );

  return newGroup.id;
};

init();

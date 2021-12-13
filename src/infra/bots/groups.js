import fetch from 'node-fetch';
import Group from '../../schemas/Group.js';
import GroupsRepository from '../../repositories/groups.js';
import { asyncFilter, execute, getArgument, log, paths } from '../../utils.js';

import '../mongoose/connection.js';

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

      const groupsRepository = new GroupsRepository();

      const groupsData = await Promise.all(
        uniqueGroups.map(async group => {
          const { group_id, account_group_id } =
            await groupsRepository.findOrInsert(group);

          return {
            id: group.id,
            name: group.name,
            group_id,
            account_group_id
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

init();

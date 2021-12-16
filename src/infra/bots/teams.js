import fetch from 'node-fetch';
import Team from '../../schemas/Team.js';
import GroupsRepository from '../../repositories/groups.js';
import { asyncFilter, execute, getArgument, log, paths } from '../../utils.js';

import '../mongoose/connection.js';

const init = () => {
  const token = getArgument('token');
  if (!token) {
    log('no token provided. Use --token argument.', 'error');
    process.exit(1);
  }

  log('fetching helpdesk teams');

  const command = `curl --request GET \
    --url https://api.helpdesk.com/v1/teams \
    --header 'Authorization: Bearer ${token}'`;

  execute(command, async (err, teams) => {
    if (!!err) {
      log.error(JSON.stringify(err), 'error');
      process.exit(1);
    }

    if (teams.length) {
      log(`found ${teams.length} teams`);
      const uniqueTeams = await asyncFilter(teams, async team => {
        const exists = await teamExists(team.name);
        return !exists;
      });

      if (!uniqueTeams?.length) {
        log('all found teams already exists');
        process.exit();
      }

      const groupsRepository = new GroupsRepository();

      const groupsData = await Promise.all(
        uniqueTeams.map(async team => {
          const { group_id, account_group_id } =
            await groupsRepository.findOrInsert(team);

          return {
            id: team.ID,
            name: team.name,
            group_id,
            account_group_id
          };
        })
      );

      const createdGroups = await Team.create(groupsData);

      log(`${createdGroups.length} teams created`);
      process.exit();
    }

    log('no team found');
    process.exit();
  });
};

const teamExists = async name => {
  const exists = await Team.exists({
    name
  });

  return exists;
};

init();

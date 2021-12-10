import chalk from 'chalk';
import fetch from 'node-fetch';
import { execute, getArgument, log } from '../utils.js';

const init = () => {
  const token = getArgument('token');
  if (!token) {
    console.error(chalk.red('> err: no token provided. Use --token argument.'));
    process.exit(1);
  }

  log('fetching live chat archives');

  const command = `curl --request POST \
    --url https://api.livechatinc.com/v3.3/agent/action/list_archives \
    --header 'Authorization: Bearer ${token}' \
    --header 'Content-Type: application/json' \
    --data '{
        "limit": 1
    }'`;

  const output = execute(command, (err, archives) => {
    if (!!err) {
      console.error(chalk.red('> err:'), err);
      process.exit(1);
    }

    if (archives.length) {
      log(`found ${archives.length} archives`);
    }

    log('no archives found');
    process.exit();
  });
};

init();

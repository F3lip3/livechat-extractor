import chalk from 'chalk';
import fetch from 'node-fetch';
import { execute, getArgument } from './utils.js';

const init = () => {
  const token = getArgument('token');
  if (!token) {
    console.error(chalk.red('> err: no token provided. Use --token argument.'));
    process.exit(1);
  }

  const command = `curl --request POST \
    --url https://api.livechatinc.com/v3.3/agent/action/list_archives \
    --header 'Authorization: Bearer ${token}' \
    --header 'Content-Type: application/json' \
    --data '{
        "limit": 100
    }'`;

  const output = execute(command, (err, response) => {
    console.info(JSON.stringify(response, null, 2));
  });
};

init();

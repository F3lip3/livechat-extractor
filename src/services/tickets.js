import chalk from 'chalk';
import fetch from 'node-fetch';
import { execute, getArgument } from './utils.js';

const init = () => {
  const token = getArgument('token');
  if (!token) {
    console.error(chalk.red('> err: no token provided. Use --token argument.'));
    process.exit(1);
  }

  const command = `curl --request GET \
    --url 'https://api.helpdesk.com/v1/tickets' \
    --header 'Authorization: Bearer ${token}'`;

  const output = execute(command, (err, response) => {
    console.info(JSON.stringify(response, null, 2));
  });
};

init();

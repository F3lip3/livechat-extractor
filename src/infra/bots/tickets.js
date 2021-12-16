import chalk from 'chalk';
import fetch from 'node-fetch';
import { execute, getArgument } from '../../utils.js';

const init = () => {
  const token = getArgument('token');
  if (!token) {
    log('no token provided. Use --token argument.', 'error');
    process.exit(1);
  }

  const command = `curl --request GET \
    --url 'https://api.helpdesk.com/v1/tickets?sortBy=updatedAt&order=desc' \
    --header 'Authorization: Bearer ${token}'`;

  const output = execute(command, (err, response) => {
    console.info(response.length);
  });
};

init();

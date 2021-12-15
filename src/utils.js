import chalk from 'chalk';
import child_process from 'child_process';
import { format } from 'date-fns';

export const paths = {
  base_url: 'https://api.livechatinc.com/v3.3'
};

export const info = {
  total: 0,
  processed: 0,
  started: new Date(Date.now()),
  lastMessages: []
};

export const asyncFilter = async (array, callback) => {
  const fail = Symbol();
  return (
    await Promise.all(
      array.map(async item => ((await callback(item)) ? item : fail))
    )
  ).filter(i => i !== fail);
};

export const execute = (command, callback) => {
  child_process.exec(
    command,
    { maxBuffer: 1024 * 1024 * 5 },
    (error, stdout, stderr) => {
      callback(error, JSON.parse(stdout));
    }
  );
};

export const getArgument = key => {
  const args = process.argv.slice(2);
  const index = args.findIndex(arg => arg === `--${key}`);
  if (index >= 0) {
    if (args.length > index + 1) {
      return args[index + 1];
    }

    return true;
  }

  return undefined;
};

export const log = (message, type = 'trace') => {
  const doTrace = getArgument('trace');
  if (type === 'trace' && !doTrace) {
    return;
  }

  const now = new Date(Date.now());
  const dif = now.getTime() - info.started.getTime();
  const sec = Math.floor(Math.abs(dif / 1000));
  const min = sec >= 60 ? Math.floor(Math.abs(sec / 60)) : 0;
  const hour = min >= 60 ? Math.floor(Math.abs(min / 60)) : 0;
  const time = hour ? `${hour}h` : min ? `${min}m` : `${sec}s`;

  console.clear();

  if (info.lastMessages.length >= 10) {
    info.lastMessages.shift();
  }

  const formattedTime = format(now, 'HH:mm:ss');

  info.lastMessages.push({ message, type });
  info.lastMessages.forEach(msg => {
    let color = chalk.gray;

    switch (msg.type) {
      case 'error':
        color = chalk.red;
        break;
      case 'info':
        color = chalk.blue;
        break;
      case 'success':
        color = chalk.green;
        break;
      case 'warning':
        color = chalk.magenta;
        break;
      default:
        color = chalk.gray;
        break;
    }

    console.info(chalk.cyan(`${formattedTime}`), color(msg.type), msg.message);
  });

  console.info(
    `${chalk.green.bold(info.processed)} of ${chalk.magenta.bold(
      info.total
    )} items processed`,
    chalk.cyanBright(time)
  );
};

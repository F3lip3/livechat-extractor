import chalk from 'chalk';
import child_process from 'child_process';

export const paths = {
  base_url: 'https://api.livechatinc.com/v3.3'
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

  switch (type) {
    case 'error':
      console.info(chalk.red('> error:'), message);
      break;
    case 'info':
      console.info(chalk.cyan('> info:'), message);
      break;
    case 'success':
      console.info(chalk.green('> success:'), message);
      break;
    case 'warning':
      console.info(chalk.magenta('> warning:'), message);
      break;
    default:
      if (doTrace) console.info(chalk.gray(`> ${type}:`), message);
      break;
  }
};

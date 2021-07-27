import chalk from 'chalk';

import { ensureString } from './string';

const logger = {
  error: (msg = '') => console.log(chalk.red(chalk.bold(ensureString(msg)))),
  info: (msg: string) => console.log(chalk.blue(ensureString(msg))),
  warn: (msg: string) => console.log(chalk.yellow(ensureString(msg))),
  debug: (msg: string) => {
    if (process.env.DEBUG) {
      console.log(ensureString(msg));
    }
  },
  log: (msg: string) => console.log(msg),
};

export default logger;

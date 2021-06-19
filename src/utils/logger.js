import chalk from 'chalk';

import { ensureString } from './string.js';

const logger = {
  error: (msg) => console.log(chalk.red(chalk.bold(ensureString(msg)))),
  info: (msg) => console.log(chalk.blue(ensureString(msg))),
  warn: (msg) => console.log(chalk.yellow(ensureString(msg))),
  debug: (msg) => {
    if (process.env.DEBUG) {
      console.log(ensureString(msg));
    }
  },
};

export default logger;

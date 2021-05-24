import chalk from 'chalk';

import { ensureString } from './string.js';

const logger = {
  debug: (msg) => console.log(chalk.yellow(ensureString(msg))),
  error: (msg) => console.log(chalk.red(chalk.bold(ensureString(msg)))),
  info: (msg) => console.log(chalk.blue(ensureString(msg))),
};

export default logger;

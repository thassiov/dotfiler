import chalk, { Chalk } from 'chalk';
import {ILocalConfigurationOperationDetails} from '../definitions/ILocalConfiguration';
import logger from './logger';

type LogColors = Pick<Chalk, 'green' | 'yellow' | 'red'>;

type SortedResults = {
  created: ILocalConfigurationOperationDetails[],
  present: ILocalConfigurationOperationDetails[],
  failed: ILocalConfigurationOperationDetails[],
};

function presentProjectResults(results: ILocalConfigurationOperationDetails[]): void {
  const { created, present, failed } = results.sort(sortByOperationType).reduce((acc: SortedResults, curr: ILocalConfigurationOperationDetails) => {
    acc[curr.status].push(curr);
    return acc;
  }, { created:[], present:[], failed:[] });

  if (created.length) {
    console.log(chalk.bgGreen('[CREATED]'));
    created.forEach(printResult);
  }

  if (present.length) {
    console.log(chalk.bgYellow('[PRESENT]'));
    present.forEach(printResult);
  }

  if (failed.length) {
    console.log(chalk.bgRed('[FAILED]'));
    failed.forEach(printResult);
  }
}

function printResult({type, dest, status, reason}: ILocalConfigurationOperationDetails): void {
  const colors: { [type: string]: string } = {
    created: 'green',
    present: 'yellow',
    failed: 'red',
  };

  logger.log(chalk[colors[status] as keyof LogColors](`${type} - ${dest} ${reason ? '\n' + chalk.bold(reason) : ''}`));
}

/**
 * Copy appears first, then symlink
 */
function sortByOperationType(first: ILocalConfigurationOperationDetails)  {
  if (first.type === 'copy') {
    return -1
  }

  if (first.type === 'symlink') {
    return 1;
  }

  return 0;
}

export {
  presentProjectResults,
};

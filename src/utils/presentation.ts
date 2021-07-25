import {ILocalConfigurationOperationDetails} from '../definitions/ILocalConfiguration.js';
import logger from './logger.js';

type LogMethods = Pick<Console, 'info' | 'warn' | 'error'>;

function presentProjectResults(results: ILocalConfigurationOperationDetails[]) {
  results.forEach(({type, dest, status, reason}) => {
    const colors: { [type: string]: string } = {
      created: 'info',
      present: 'warn',
      failed: 'error',
    };

    logger[colors[status] as keyof LogMethods](`[${status.toUpperCase()}] ${type} - ${dest} ${reason ? '\n\t       ' + reason : ''}`);
  });
}

export {
  presentProjectResults,
};

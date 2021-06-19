import logger from './logger.js';

function presentProjectResults(results) {
  results.forEach(({type, dest, status, reason}) => {
    const colors = {
      created: 'info',
      present: 'warn',
      failed: 'error',
    };

    logger[colors[status]](`[${status.toUpperCase()}] ${type} - ${dest} ${reason ? '\n\t       ' + reason : ''}`);
  });
}

export {
  presentProjectResults,
};

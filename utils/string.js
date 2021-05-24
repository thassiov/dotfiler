import logger from './logger.js';

function ensureString (data) {
  if (typeof data !== 'string') {
    return JSON.stringify(data);
  }
  return data;
}

function removeNewLines(str) {
  return str.replace(/\s+/g, '');
}

function limitStringSize(str, size) {
  if (str.length > size ) {
    return str.substring(0, size) + '...';
  }
  return str
}

function strToJson(str) {
  logger.debug(`[strToJson] ${removeNewLines(limitStringSize(str, 50))}`);
  try {
    return JSON.parse(str);
  } catch (err) {
    logger.error('Cannot parse string to json');
    logger.error(err);
    throw err;
  }
}

export {
  ensureString,
  removeNewLines,
  limitStringSize,
  strToJson,
};

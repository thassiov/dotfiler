import {
  isAbsolute,
  join, 
} from 'path';
import {
  ensureString,
  limitStringSize,
} from './string.js';
import logger from './logger.js';
import { promises as fsp } from 'fs';

async function isPathOfType(path, type) {
  logger.debug(`[isPathOfType] ${path}:${type}`);
  if (!path) {
    throw new Error(`Value for 'path' cannot be empty`);
  }

  if (!type) {
    throw new Error(`Value for 'type' cannot be empty`);
  }

  const testingMethod = {
    'file':'isFile',
    'directory':'isDirectory',
    'symlink':'isSymbolicLink',
  };

  try {
    const pathStat = await fsp.lstat(path);
    return await pathStat[testingMethod[type]]();
  } catch (err) {
    if (err.code == 'ENOENT') {
      return false;
    }
    logger.error('[isPathOfType] error');
    logger.error(err);
    throw err;
  }
}

async function fileLoader(filePath) {
  logger.debug(`[fileLoader] ${filePath}`);

  if (!filePath) {
    throw new Error('No input file provided');
  }

  try {
    const fileBuffer = await fsp.readFile(filePath, { encoding: 'utf-8' });
    return fileBuffer;
  } catch (fileError) {
    logger.error('Cannot reach input file');
    logger.error(fileError);
    throw fileError;
  }
}

async function createConfigSymLink(config) {
  logger.debug(`[createConfigSymLink] ${limitStringSize(ensureString(config), 50)}`);
  try {
    await fsp.symlink(config.src, config.dest);
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

async function copyConfig(config) {
  logger.debug(`[copyConfig] ${limitStringSize(ensureString(config), 50)}`);
  try {
    // @TODO create directory
    // @TODO copy contents from source
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

function resolveConfigDestPaths(config) {
  logger.debug(`[resolveConfigDestPaths] ${limitStringSize(ensureString(config), 50)}`);

  const { dest } = config;

  if (isAbsolute(dest)) {
    return config;
  }

  return {
    ...config,
    dest: dest[0] === '~' ? join(process.env.HOME, dest.slice(1)) : dest,
  };
}

export {
  isPathOfType,
  fileLoader,
  createConfigSymLink,
  copyConfig,
  resolveConfigDestPaths,
};

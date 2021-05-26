import {
  isAbsolute,
  join,
  dirname,
} from 'path';
import {
  ensureString,
  limitStringSize,
} from './string.js';
import logger from './logger.js';
import { promises as fsp } from 'fs';

// fs-extra is commonjs
import fsExtra from 'fs-extra';

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

function getDirectoryFromFilePath(filePath) {
  return dirname(filePath);
}

async function ensureDir(dirPath) {
  return fsExtra.ensureDir(dirPath);
}

async function copy(src, dest, overwrite = false) {
  logger.debug(`[copy] ${limitStringSize(src, 25, true) + ':' + limitStringSize(dest, 25, true)}`);
  // if the destination exists and the user don't set overwrite=true, I want the error to be thrown
  const options = {
    overwrite,
    errorOnExist: !overwrite,
  };

  return fsExtra.copy(src, dest, options);
}

async function symlink(src, dest, overwrite = false) {
  logger.debug(`[symlink] ${limitStringSize(src, 25, true) + ':' + limitStringSize(dest, 25, true)}`);
  return await fsp.symlink(src, dest);
}

async function copyFile(config) {
  logger.debug(`[copyFile] ${limitStringSize(ensureString(config), 50)}`);
  try {
    await ensureDir(getDirectoryFromFilePath(config.dest));
    // @TODO I am not covering the case where the destination is a directory
    // and not a file name. The destination has to have the file at the end
    // of the path. I'll cover the case of putting the source inside the
    // destination when it is a directory later.
    await copy(config.src, config.dest, config.overwrite);

    return true;
  } catch (err) {
    return err;
  }
}

async function copyDirectory(config) {
  logger.debug(`[copyDirectory] ${limitStringSize(ensureString(config), 50)}`);
  try {
    await ensureDir(config.dest);
    await copy(config.src, config.dest, config.overwrite);
    return true;
  } catch (err) {
    return err;
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
    throw fileError;
  }
}

async function createConfigSymLink(config) {
  logger.debug(`[createConfigSymLink] ${limitStringSize(ensureString(config), 50)}`);
  try {
    await symlink(config.src, config.dest);
    return true;
  } catch (err) {
    return err;
  }
}

async function copyConfig(config) {
  logger.debug(`[copyConfig] ${limitStringSize(ensureString(config), 50)}`);
  try {
    // @TODO maybe handle the case when the config path is a symlink as well, idk
    const [isFile, isDirectory] = await Promise.all([
      isPathOfType(config.src, 'file'),
      isPathOfType(config.src, 'directory'),
    ]);

    if (isFile) {
      return await copyFile(config);
    }

    if (isDirectory) {
      return await copyDirectory(config);
    }

    // @NOTE aaaaaaaaaaaaa
    return false;
  } catch (err) {
    logger.error(`[copyConfig] Could not create copy for ${config.src}: ${err.message}`)
    return false;
  }
}

function resolveConfigDestPaths(config) {
  logger.debug(`[resolveConfigDestPaths] ${limitStringSize(ensureString(config), 50)}`);

  const { dest } = config;

  if (isAbsolute(dest)) {
    return config;
  }

  // @NOTE this '~' thing is important. Should be documented.
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

import {
  isAbsolute,
  join,
  dirname,
} from 'path';
import logger from './logger.js';
import { promises as fsp, Stats } from 'fs';
import fsExtra from 'fs-extra';

import { ILocalConfigurationItem } from '../definitions/ILocalConfiguration.js';

async function isPathOfType(path: string, type: string): Promise<boolean> {
  if (!path) {
    throw new Error(`Value for 'path' cannot be empty`);
  }

  if (!type) {
    throw new Error(`Value for 'type' cannot be empty`);
  }

  type StatTestingMethods = Pick<Stats, 'isFile' | 'isDirectory' | 'isSymbolicLink'>;

  const testingMethod: { [type: string]: string } = {
    file: 'isFile',
    directory: 'isDirectory',
    symlink: 'isSymbolicLink',
  };

  try {
    const pathStat = await fsp.lstat(path);
    return pathStat[testingMethod[type] as keyof StatTestingMethods]();
  } catch (err) {
    if (err.code == 'ENOENT') {
      return false;
    }
    logger.error('[isPathOfType] error');
    logger.error(err);
    throw err;
  }
}

async function doesTargetExist(path: string): Promise<boolean> {
  if (!path) {
    throw new Error(`Value for 'path' cannot be empty`);
  }

  try {
    await fsp.lstat(path);
    return true;
  } catch (err) {
    if (err.code == 'ENOENT') {
      return false;
    }
    logger.error('[isPathOfType] error');
    logger.error(err);
    throw err;
  }
}

function getDirectoryFromFilePath(filePath: string): string {
  return dirname(filePath);
}

async function ensureDir(dirPath: string): Promise<void> {
  return fsExtra.ensureDir(dirPath);
}

async function copy(src: string, dest: string): Promise<void> {
  return fsExtra.copy(src, dest);
}

async function symlink(src: string, dest: string): Promise<void> {
  return await fsp.symlink(src, dest);
}

async function copyFile(config: ILocalConfigurationItem): Promise<void> {
  try {
    await ensureDir(getDirectoryFromFilePath(config.dest));
    // @TODO I am not covering the case where the destination is a directory
    // and not a file name. The destination has to have the file at the end
    // of the path. I'll cover the case of putting the source inside the
    // destination when it is a directory later.
    return copy(config.src, config.dest);
  } catch (err) {
    return err;
  }
}

async function copyDirectory(config: ILocalConfigurationItem): Promise<void> {
  try {
    await ensureDir(config.dest);
    return copy(config.src, config.dest);
  } catch (err) {
    return err;
  }
}

async function fileLoader(filePath: string): Promise<string> {
  if (!filePath) {
    throw new Error('No input file provided');
  }

  try {
    const fileAsString = await fsp.readFile(filePath, { encoding: 'utf-8' });
    return fileAsString;
  } catch (fileError) {
    throw fileError;
  }
}

async function symlinkConfig(config: ILocalConfigurationItem): Promise<void> {
  try {
    return symlink(config.src, config.dest);
  } catch (err) {
    return err;
  }
}

async function copyConfig(config: ILocalConfigurationItem): Promise<void> {
  try {
    // @TODO maybe handle the case when the config path is a symlink as well, idk
    // @TODO also, this could be better...
    const [isFile, isDirectory] = await Promise.all([
      isPathOfType(config.src, 'file'),
      isPathOfType(config.src, 'directory'),
    ]);

    if (isFile) {
      return await copyFile(config);
    } else if (isDirectory) {
      return await copyDirectory(config);
    }
  } catch (err) {
    logger.error(`[copyConfig] Could not create copy for ${config.src}: ${err.message}`)
    throw err;
  }
}

function resolveConfigDestPaths(config: ILocalConfigurationItem): ILocalConfigurationItem {
  const { dest } = config;

  if (isAbsolute(dest)) {
    return config;
  }

  // @NOTE this '~' thing is important. Should be documented.
  return {
    ...config,
    dest: dest[0] === '~' ? join(process.env.HOME as string, dest.slice(1)) : dest,
  }
}

export {
  isPathOfType,
  doesTargetExist,
  fileLoader,
  symlinkConfig,
  copyConfig,
  resolveConfigDestPaths,
};

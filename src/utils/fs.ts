import {
  isAbsolute,
  join,
  dirname,
  normalize,
  parse,
} from 'path';
import { promises as fsp, Stats } from 'fs';
import fsExtra from 'fs-extra';

import logger from './logger';

import { ILocalConfiguration, ILocalConfigurationItem } from '../definitions/ILocalConfiguration';
import { readdir, writeFile } from 'fs/promises';

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

async function typeOfTarget(path: string): Promise<string> {
  if (!path) {
    throw new Error(`Value for 'path' cannot be empty`);
  }

  try {
    const pathStat = await fsp.lstat(path);

    if (pathStat.isSymbolicLink()) {
      return 'symlink';
    }

    if (pathStat.isFile()) {
      return 'file';
    }

    if (pathStat.isDirectory()) {
      return 'directory';
    }

    return 'unsupported';
  } catch (err) {
    if (err.code == 'ENOENT') {
      return 'enoent';
    }
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

async function getContentsFromDirectory(path: string): Promise<string[]> {
  return await readdir(path).then(items => items.filter((item: string) => !['.', '..'].includes(item)));
}

async function writeConfigToFile(path: string, config: ILocalConfiguration): Promise<void> {
  await writeFile(path, JSON.stringify(config));
}

function getBaseFromFilePath(filePath: string): string {
  return parse(filePath).base;
}

async function ensureDir(dirPath: string): Promise<void> {
  return fsExtra.ensureDir(dirPath);
}

async function copy(src: string, dest: string): Promise<void> {
  if (!await doesTargetExist(src)) {
    throw new Error(`Source file/directory does not exist: ${src}`);
  }

  return await fsExtra.copy(src, dest);
}

async function symlink(src: string, dest: string): Promise<void> {
  if (!await doesTargetExist(src)) {
    throw new Error(`Source file/directory does not exist: ${src}`);
  }

  if (!await doesTargetExist(getDirectoryFromFilePath(dest))) {
    await ensureDir(getDirectoryFromFilePath(dest));
    // throw new Error(`Parent directory for that will hold the symlink for ${src} does not exist: ${dest}`);
  }

  const srcType = await typeOfTarget(src);
  const destType = await typeOfTarget(dest);

  switch (destType) {
    case 'enoent':
      // if the source is a directory, the destination cannot have a trailing '/' or else it won't create the symlink
      return await fsp.symlink(src, srcType == 'directory' ? removeSlashFromDirectoryPathIfPresent(dest) : dest);
    case 'directory':
      return await fsp.symlink(src, dest);
    default:
    const fileName = getBaseFromFilePath(src);
    return await fsp.symlink(src, normalize(join(dest, fileName)));
  }
}

function removeSlashFromDirectoryPathIfPresent(path: string): string {
  if (path.endsWith('/')) {
    return path.slice(0, -1)
  }

  return path;
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
    const fileAsString = await fsp.readFile(tryExapandHomeTildeAlias(filePath), { encoding: 'utf-8' });
    return fileAsString;
  } catch (fileError) {
    throw fileError;
  }
}

async function symlinkConfig(config: ILocalConfigurationItem): Promise<void> {
  try {
    return symlink(config.src, config.dest);
  } catch (err) {
    throw new Error(`Could not symlink ${config.src}: ${err.message}`);
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
    throw new Error(`Could not copy ${config.src}: ${err.message}`);
  }
}

function tryExapandHomeTildeAlias(path: string): string {
  return path[0] === '~' ? join(process.env.HOME as string, path.slice(1)) : path;
}

function resolveConfigDestPaths(config: ILocalConfigurationItem): ILocalConfigurationItem {
  const { dest } = config;

  if (isAbsolute(dest)) {
    return config;
  }

  // @NOTE this '~' thing is important. Should be documented.
  return {
    ...config,
    dest: tryExapandHomeTildeAlias(dest),
  }
}

export {
  isPathOfType,
  doesTargetExist,
  fileLoader,
  symlinkConfig,
  copyConfig,
  resolveConfigDestPaths,
  getBaseFromFilePath,
  getContentsFromDirectory,
  writeConfigToFile,
};

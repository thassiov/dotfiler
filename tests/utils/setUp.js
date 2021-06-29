import {
  chmod
} from 'fs/promises';

import { join } from 'path';

import {
  ensureFile,
  remove,
  outputFile,
  ensureDir,
} from 'fs-extra';

import {
  DEFAULT_GLOBAL_CONFIG_OBJECT,
  DEFAULT_GLOBAL_CONFIG_FILE_PATH,
  DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH,
  DEFAULT_LOCAL_CONFIG_FILE_PATH,
} from '../../src/utils/constants';

export async function removeGlobalConfigFile() {
  await remove(DEFAULT_GLOBAL_CONFIG_FILE_PATH);
}

export async function removeLocalConfigDirectory(alternativeDirPath) {
  await remove(alternativeDirPath || DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH);
}

export async function removeLocalConfigFile(alternativeFilePath) {
  await remove(alternativeFilePath || DEFAULT_LOCAL_CONFIG_FILE_PATH);
}

export async function createGlobalConfigFile(alternativeConfigObject) {
  await outputFile(DEFAULT_GLOBAL_CONFIG_FILE_PATH, JSON.stringify(alternativeConfigObject || DEFAULT_GLOBAL_CONFIG_OBJECT));
}

export async function createLocalConfigDirectory(alternativeDirPath) {
  await ensureDir(alternativeDirPath || DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0].location);
}

export async function createEmptyLocalConfigFile(alternativeFilePath) {
  // I could've used `ensureFile` here, but this function does not overwrite the file and I wanted
  // this behavior. `outputFile` does overwrite.
  await outputFile(alternativeFilePath || DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0].location, '');
}

export async function createLocalConfigFile(configObject, alternativeFilePath) {
  await outputFile(alternativeFilePath || DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0].location, JSON.stringify(configObject));
}

export async function makeLocalConfigFileUnreadable(alternativeFilePath) {
  // [https://nodejs.org/dist/latest-v14.x/docs/api/fs.html#fs_file_modes]
  await chmod(alternativeFilePath || DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0].location, 0o000);
}

export async function makeGlobalConfigFileUnreadable() {
  // [https://nodejs.org/dist/latest-v14.x/docs/api/fs.html#fs_file_modes]
  await chmod(DEFAULT_GLOBAL_CONFIG_FILE_PATH, 0o000);
}

export async function createSourceFilesBasedOnLocalConfig(localConfig) {
  const base = localConfig.location; // has to be a directory
  const filesToCreate = localConfig.configs.map(({ src }) => {
    // console.log('crate', src);
    return src.endsWith('/') ? ensureDir(join(base, src)) : ensureFile(join(base, src));
  });

  await Promise.all(filesToCreate);
}

export async function deleteSourceFilesBasedOnLocalConfig(localConfig) {
  const base = localConfig.location; // has to be a directory
  const filesToDelete = localConfig.configs.map(({ src }) => {
    // console.log('delete src:', join(base, src));
    return remove(join(base, src));
  });

  await Promise.all(filesToDelete);
}

export async function deleteDestFilesBasedOnLocalConfig(localConfig) {
  const filesToDelete = localConfig.configs.map(({ dest }) => {
    // console.log('delete dest:', dest);
    return remove(dest);
  });

  await Promise.all(filesToDelete);
}

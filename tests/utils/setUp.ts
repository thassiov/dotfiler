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
} from '../../src/definitions/constants';

import {
  ILocalConfiguration,
  IGlobalConfiguration,
} from '../../src/definitions';

type ILocalConfigurationWithBaseLocation = ILocalConfiguration & Pick<IGlobalConfiguration, 'location'>;

export async function removeGlobalConfigFile(): Promise<void> {
  await remove(DEFAULT_GLOBAL_CONFIG_FILE_PATH);
}

export async function removeLocalConfigDirectory(alternativeDirPath?: string): Promise<void> {
  await remove(alternativeDirPath || DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH);
}

export async function removeLocalConfigFile(alternativeFilePath?: string): Promise<void> {
  await remove(alternativeFilePath || DEFAULT_LOCAL_CONFIG_FILE_PATH);
}

export async function createGlobalConfigFile(alternativeConfigObject?: string): Promise<void> {
  await outputFile(DEFAULT_GLOBAL_CONFIG_FILE_PATH, JSON.stringify(alternativeConfigObject || DEFAULT_GLOBAL_CONFIG_OBJECT));
}

export async function createLocalConfigDirectory(alternativeDirPath?: string): Promise<void> {
  await ensureDir(alternativeDirPath || DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0].location);
}

export async function createEmptyLocalConfigFile(alternativeFilePath?: string): Promise<void> {
  // I could've used `ensureFile` here, but this function does not overwrite the file and I wanted
  // this behavior. `outputFile` does overwrite.
  await outputFile(alternativeFilePath || DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0].location, '');
}

export async function createLocalConfigFile(configObject: ILocalConfiguration, alternativeFilePath?: string): Promise<void> {
  await outputFile(alternativeFilePath || DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0].location, JSON.stringify(configObject));
}

export async function makeLocalConfigFileUnreadable(alternativeFilePath?: string): Promise<void> {
  // [https://nodejs.org/dist/latest-v14.x/docs/api/fs.html#fs_file_modes]
  await chmod(alternativeFilePath || DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0].location, 0o000);
}

export async function makeGlobalConfigFileUnreadable(): Promise<void> {
  // [https://nodejs.org/dist/latest-v14.x/docs/api/fs.html#fs_file_modes]
  await chmod(DEFAULT_GLOBAL_CONFIG_FILE_PATH, 0o000);
}

export async function createSourceFilesBasedOnLocalConfig(localConfig: ILocalConfigurationWithBaseLocation): Promise<void> {
  const base = localConfig.location; // has to be a directory
  const filesToCreate = localConfig.configs.map(({ src }) => {
    return src.endsWith('/') ? ensureDir(join(base, src)) : ensureFile(join(base, src));
  });

  await Promise.all(filesToCreate);
}

export async function deleteSourceFilesBasedOnLocalConfig(localConfig: ILocalConfigurationWithBaseLocation) {
  const base = localConfig.location; // has to be a directory
  const filesToDelete = localConfig.configs.map(({ src }) => {
    return remove(join(base, src));
  });

  await Promise.all(filesToDelete);
}

export async function deleteDestFilesBasedOnLocalConfig(localConfig: ILocalConfiguration) {
  const filesToDelete = localConfig.configs.map(({ dest }) => {
    return remove(dest);
  });

  await Promise.all(filesToDelete);
}

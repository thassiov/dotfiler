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
  DEFAULT_CONFIG_FILE_NAME,
} from '../../src/definitions/constants';

import {
  ILocalConfiguration,
  IGlobalConfiguration,
  IGlobalConfigurationItem,
} from '../../src/definitions';

import {
  copyTarget,
  symlinkTarget
} from '../../src/target-handler';

export type ILocalConfigurationWithBaseLocation = ILocalConfiguration & Pick<IGlobalConfigurationItem, 'location'>;

export async function removeGlobalConfigFile(): Promise<void> {
  await remove(DEFAULT_GLOBAL_CONFIG_FILE_PATH);
}

export async function removeLocalConfigDirectory(alternativeDirPath?: string): Promise<void> {
  await remove(alternativeDirPath || DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH);
}

export async function removeLocalConfigFile(alternativeFilePath?: string): Promise<void> {
  await remove(alternativeFilePath || DEFAULT_LOCAL_CONFIG_FILE_PATH);
}

export async function createGlobalConfigFile(alternativeConfigObject?: IGlobalConfiguration, alternativeConfigFilePath?: string): Promise<void> {
  await outputFile(join(alternativeConfigFilePath || DEFAULT_GLOBAL_CONFIG_FILE_PATH, DEFAULT_CONFIG_FILE_NAME), JSON.stringify(alternativeConfigObject || DEFAULT_GLOBAL_CONFIG_OBJECT));
}

export async function createLocalConfigDirectory(alternativeDirPath?: string): Promise<void> {
  await ensureDir(alternativeDirPath || DEFAULT_GLOBAL_CONFIG_OBJECT?.dotfiles[0]?.location as string);
}

export async function createEmptyLocalConfigFile(alternativeFilePath?: string): Promise<void> {
  // I could've used `ensureFile` here, but this function does not overwrite the file and I wanted
  // this behavior. `outputFile` does overwrite.
  await outputFile(join(alternativeFilePath || DEFAULT_GLOBAL_CONFIG_OBJECT?.dotfiles[0]?.location as string, DEFAULT_CONFIG_FILE_NAME), '');
}

export async function createLocalConfigFile(configObject: ILocalConfiguration, alternativeFilePath?: string): Promise<void> {
  await outputFile(join(alternativeFilePath || DEFAULT_GLOBAL_CONFIG_OBJECT?.dotfiles[0]?.location as string, DEFAULT_CONFIG_FILE_NAME), JSON.stringify(configObject));
}

export async function makeLocalConfigFileUnreadable(alternativeFilePath?: string): Promise<void> {
  await makePathUnreadable(alternativeFilePath || DEFAULT_GLOBAL_CONFIG_OBJECT?.dotfiles[0]?.location as string);
}

export async function makePathUnreadable(path: string): Promise<void> {
  // [https://nodejs.org/dist/latest-v14.x/docs/api/fs.html#fs_file_modes]
  await chmod(path, 0o000);
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

export async function createDestinationFilesBasedOnLocalConfig(localConfig: ILocalConfigurationWithBaseLocation): Promise<void> {
  const filesToCreate = localConfig.configs.map((config) => {
    const src = join(localConfig.location, config.src);
    return config.copy ? copyTarget({...config, src}) : symlinkTarget({...config, src});
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

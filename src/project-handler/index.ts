import { join, dirname, parse } from 'path';

import { getLocalConfig } from '../internal';
import { copyTarget, symlinkTarget } from '../target-handler';

import { isPathOfType, resolveConfigDestPaths } from "../utils/fs";
import {
  ConfigurationOperationType,
  ILocalConfigurationItem,
  ILocalConfigurationOperationDetails
} from '../definitions/ILocalConfiguration';

import {
  IGlobalConfigurationItem,
  DEFAULT_CONFIG_FILE_NAME,
} from '../definitions';

type Settled = {
  value?: object;
  reason?: object;
};

/**
 * Gets the project's configuration and executes the copies and symlinks
 * defined for each target
 *
 * @returns a JSON
 */
export default async function projectHandler(project: IGlobalConfigurationItem) {
  if (!project.location) {
    throw new Error(`project ${project.name || parse(project.location).base }: the 'location' property of a project cannot be empty`);
  }

  let configPath = project.location;;

  if (await shouldAppendDefaultConfigFileName(configPath)) {
    configPath = join(project.location, DEFAULT_CONFIG_FILE_NAME);
  }

  const projectInfo = await getLocalConfig(configPath);

  if (!projectInfo.configs || !Array.isArray(projectInfo.configs)) {
    throw new Error(`project ${project.name || parse(project.location).base }: the 'configs' property of the local config must be an array`);
  }

  if (!projectInfo.configs.length) {
    // nothing to do here.
    return [];
  }

  // this figures out the config file/dir full path as it will be needed later
  const configFilePrefix = dirname(configPath);

  const configsToHandle = projectInfo.configs
    .map((config: ILocalConfigurationItem) => ({...config, src: join(configFilePrefix, config.src)}))
    .map(resolveConfigDestPaths)
    .map(handleConfig);

  const results = await Promise.allSettled(configsToHandle)
  .then(results => results.map((result: Settled) =>  result.value ? result.value : result.reason));

  return results;
}

async function shouldAppendDefaultConfigFileName(location: string): Promise<boolean> {
  // @TODO maybe handle the case when the config path is a syn link as well, idk
  if (await isPathOfType(location, 'directory')) {
    return true;
  }

  return false;
}

async function handleConfig(config: ILocalConfigurationItem): Promise<ILocalConfigurationOperationDetails> {
  // @TODO if copied, check fo checksum of something that can state a diff between the two
  const opResult = config.copy == true ? await copyTarget(config) : await symlinkTarget(config);

  return {
    ...opResult,
    dest: config.dest,
    type: config.copy ? ConfigurationOperationType.COPY : ConfigurationOperationType.SYMLINK,
  };
}

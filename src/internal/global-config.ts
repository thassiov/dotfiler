import { join } from 'path';

import logger from '../utils/logger';

import {
  DEFAULT_GLOBAL_CONFIG_OBJECT,
  DEFAULT_GLOBAL_CONFIG_FILE_PATH,
  DEFAULT_CONFIG_FILE_NAME
} from '../definitions/constants';
import { fileLoader } from '../utils/fs';
import { IGlobalConfiguration } from '../definitions';
import { yamlToJson } from '../utils/contentTypeConverter';

/**
 * Gets the configuration file that lists the projects covered
 * by dotfiler.
 *
 * @returns IGlobalConfiguration
 */
export async function handler(globalConfigFilePath?: string): Promise<IGlobalConfiguration> {
  const globalConfigPath = join(globalConfigFilePath || DEFAULT_GLOBAL_CONFIG_FILE_PATH, DEFAULT_CONFIG_FILE_NAME);
  try {
    return await yamlToJson(await fileLoader(globalConfigPath)) as IGlobalConfiguration;
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.debug(`[getGlobalConfig] Global information not found. Defaulting to ${DEFAULT_GLOBAL_CONFIG_OBJECT?.dotfiles[0]?.location}`);
      return DEFAULT_GLOBAL_CONFIG_OBJECT;
    }
    throw new Error(`Could not read the following global config: ${globalConfigPath}\tReason: ${err.message} [${err.code}]`);
  }
}

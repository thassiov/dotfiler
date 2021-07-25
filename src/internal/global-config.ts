import logger from '../utils/logger';

import {
  DEFAULT_GLOBAL_CONFIG_OBJECT,
  DEFAULT_GLOBAL_CONFIG_FILE_PATH
} from '../definitions/constants';
import { fileLoader } from '../utils/fs';
import { strToJson } from '../utils/string';
import { IGlobalConfiguration } from '../definitions';

/**
 * Gets the configuration file that lists the projects covered
 * by dotfiler.
 *
 * @returns IGlobalConfiguration
 */
export async function handler(): Promise<IGlobalConfiguration> {
  try {
    const config = strToJson(await fileLoader(DEFAULT_GLOBAL_CONFIG_FILE_PATH)) as IGlobalConfiguration;
    return config;
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.debug(`[getGlobalConfig] Global information not found. Defaulting to ${DEFAULT_GLOBAL_CONFIG_OBJECT?.dotfiles[0]?.location}`);
      return DEFAULT_GLOBAL_CONFIG_OBJECT;
    }
    throw err;
  }
}

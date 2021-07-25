import logger from '../utils/logger';

import {
  DEFAULT_GLOBAL_CONFIG_OBJECT,
  DEFAULT_GLOBAL_CONFIG_FILE_PATH
} from '../utils/constants';
import { fileLoader } from '../utils/fs';
import { strToJson } from '../utils/string';

/**
 * Gets the configuration file that lists the projects covered
 * by dotfiler.
 *
 * @returns a JSON structure
 */
export async function handler() {
  try {
    const config = strToJson(await fileLoader(DEFAULT_GLOBAL_CONFIG_FILE_PATH));
    return config;
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.debug(`[getGlobalConfig] Global information not found. Defaulting to ${DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0].location}`);
      return DEFAULT_GLOBAL_CONFIG_OBJECT;
    }
    throw err;
  }
}

import { ILocalConfiguration } from "../definitions";
import {yamlToJson} from "../utils/contentTypeConverter";
import { fileLoader } from "../utils/fs";
import logger from "../utils/logger";

/**
 * Gets the file that tracks the contents of the current project.
 * This file contains the target file (`src`), where it should be
 * placed (`dest`) and wheter to copy of symlink it (`copy`)
 *
 * @returns ILocalConfiguration
 */
export async function handler(configPath: string): Promise<ILocalConfiguration> {
  try {
    return await yamlToJson(await fileLoader(configPath)) as ILocalConfiguration;
  } catch (err) {
    logger.error(`Error when reading the local configuration file (${configPath}): ${err.code}`);
    logger.error(err.message);
    throw err;
  }
}

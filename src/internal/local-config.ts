import { ILocalConfiguration } from "../definitions";
import {yamlToJson} from "../utils/contentTypeConverter";
import { fileLoader } from "../utils/fs";

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
    throw new Error(`Could not read the following local config: ${configPath}\tReason: ${err.message} [${err.code}]`);
  }
}

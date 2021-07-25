import { ILocalConfiguration } from "../definitions";
import { fileLoader } from "../utils/fs";
import { strToJson } from "../utils/string";

/**
 * Gets the file that tracks the contents of the current project.
 * This file contains the target file (`src`), where it should be
 * placed (`dest`) and wheter to copy of symlink it (`copy`)
 *
 * @returns ILocalConfiguration
 */
export async function handler(configPath: string): Promise<ILocalConfiguration> {
  try {
    const config = strToJson(await fileLoader(configPath));
    return config;
  } catch (err) {
    throw err;
  }
}

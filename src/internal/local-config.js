import { fileLoader } from "../utils/fs";
import { strToJson } from "../utils/string";

/**
 * Gets the file that tracks the contents of the current project.
 * This file contains the target file (`src`), where it should be
 * placed (`dest`) and wheter to copy of symlink it (`copy`)
 *
 * @returns a JSON
 */
export async function handler(configPath) {
  try {
    const config = strToJson(await fileLoader(configPath));
    return config;
  } catch (err) {
    throw err;
  }
}

import { parse } from "path";
import {
  ILocalConfiguration,
  ILocalConfigurationItem,
} from "../definitions";
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

    const fileContents = await fileLoader(configPath);
    let config = await yamlToJson(fileContents);

    // for when we have a yaml
    if (typeof config == 'string') {
      try {
        config = JSON.parse(config);
      } catch (jsonError) {
        throw new Error(`The contents of ${configPath} do not follow the correct config structure ${fileContents}`);
      }
    }

    if (!config || !isProjectConfig(config) || !config?.configs.filter(isLocalConfigurationItem).length) {
      throw new Error(`The contents of ${configPath} do not follow the correct config structure ${JSON.stringify(config, null, 2)}`);
    }

    return config as ILocalConfiguration;
  } catch (err) {
    throw new Error(`Could not read the .dotfiler config from the following project: ${parse(configPath).dir}. Reason: ${err.message}${err.code ? ' [' + err.code +']' : '.' }`);
  }
}

function isProjectConfig(config: any): config is ILocalConfiguration {
  return Array.isArray((config as ILocalConfiguration).configs);
}

function isLocalConfigurationItem(config: any): config is ILocalConfigurationItem {
  return (config as ILocalConfigurationItem).src != undefined;
}

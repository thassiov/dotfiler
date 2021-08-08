import { join, resolve } from "path";
import { DEFAULT_CONFIG_FILE_NAME } from "../definitions";
import { jsonToYaml } from "../utils/contentTypeConverter";
import { doesTargetExist, getContentsFromDirectory, writeConfigToFile } from "../utils/fs";

export default async function generateConfig(path: string, asYaml = true): Promise<string> {
  if (await doesTargetExist(join(path, DEFAULT_CONFIG_FILE_NAME))) {
    throw new Error(`There's a file named '.dotfiler' in this directory (${path})`);
  }

  const configFilePath = join(path, DEFAULT_CONFIG_FILE_NAME);
  const contents = await getContentsFromDirectory(path);
  let projectConfig = {
    configs: contents.map((item) => ({ src: item, dest: join(resolve(path, '..'), item) })),
  };

  await writeConfigToFile(configFilePath, asYaml ?  await jsonToYaml(projectConfig) : JSON.stringify(projectConfig));
  return configFilePath;
}

import { join, resolve } from "path";
import { DEFAULT_CONFIG_FILE_NAME } from "../definitions";
import { getContentsFromDirectory, writeConfigToFile } from "../utils/fs";

export default async function generateConfig(path: string): Promise<string> {
  const contents = await getContentsFromDirectory(path);
  const configs = contents.map((item) => ({ src: item, dest: resolve(path, '..') }));
  const configFilePath = join(path, DEFAULT_CONFIG_FILE_NAME);
  await writeConfigToFile(configFilePath, { configs });
  return configFilePath;
}

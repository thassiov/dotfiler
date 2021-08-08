import { dump, load } from 'js-yaml';
import logger from './logger';

type json = {
  [name: string]: any;
};

export async function yamlToJson(yamlContent: string): Promise<json> {
  try {
    return load(yamlContent) as json;
  } catch (convertionError) {
    logger.error(`Could not convert yaml content to json: ${convertionError.message}`);
    throw convertionError;
  }
}

export async function jsonToYaml(jsonContent: json): Promise<string> {
  try {
    return dump(jsonContent) as string;
  } catch (convertionError) {
    logger.error(`Could not convert json content to yaml: ${convertionError.message}`);
    throw convertionError;
  }
}

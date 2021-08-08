import { dump, load } from 'js-yaml';
import logger from './logger';

type ConvertionResultObject = {
  [name: string]: any;
};

type ConvertionResultString = string;

export async function yamlToJson(yamlContent: string): Promise<ConvertionResultObject> {
  try {
    return load(yamlContent) as ConvertionResultObject;
  } catch (convertionError) {
    logger.error(`Could not convert yaml content to json: ${convertionError.message}`);
    throw convertionError;
  }
}

export async function jsonToYaml(jsonContent: string): Promise<ConvertionResultString> {
  try {
    return dump(jsonContent) as ConvertionResultString;
  } catch (convertionError) {
    logger.error(`Could not convert json content to yaml: ${convertionError.message}`);
    throw convertionError;
  }
}

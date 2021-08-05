#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import projectHandler from './project-handler/index';
import { presentProjectResults } from './utils/presentation';
import logger from './utils/logger';
import {ILocalConfigurationOperationDetails} from './definitions';
import { getBaseFromFilePath } from './utils/fs';
import { normalize } from 'path';

type ConfigurationRunResult = PromiseSettledResult<ILocalConfigurationOperationDetails>;

(async() => {
  try {
    const projectPath = getProjectPathFromCliArgs(process.argv);
    const projectResults: ConfigurationRunResult[] = await projectHandler({ name: getBaseFromFilePath(projectPath), location: projectPath });
    presentProjectResults(projectResults.map(getConfigurationRunResults));
  } catch (err) {
    logger.error(err);
    logger.error('Exiting...');
    process.exit(err.errno);
  }
})();

function getProjectPathFromCliArgs(args: Array<string>): string {
  const path = getFilePathFromCliArgs(args);

  if (!path || path == '.') {
    return process.cwd();
  }

  return normalize(path);
}

function getFilePathFromCliArgs(args: Array<string>): string {
  const usefulStrings = args.slice(2);
  if (usefulStrings.length) {
    return usefulStrings[0] as string;
  }
  return '';
}

function getConfigurationRunResults(runData: ConfigurationRunResult) {
  if (runData.status === 'fulfilled') {
    return runData.value;
  }

  return runData.reason;
}

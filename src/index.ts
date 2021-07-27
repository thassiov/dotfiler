#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import projectHandler from './project-handler/index';
import { presentProjectResults } from './utils/presentation';
import { getGlobalConfig } from './internal';
import logger from './utils/logger';
import {ILocalConfigurationOperationDetails} from './definitions';

type ConfigurationRunResult = PromiseSettledResult<ILocalConfigurationOperationDetails>;
type ProjectRunResults = PromiseSettledResult<ConfigurationRunResult[]>;

(async() => {
  const cliArgs = getFilePathFromCliArgs(process.argv);

  try {
  const gConfigContent = await getGlobalConfig(cliArgs || process.env.DOTFILER_GLOBAL_CONFIG_PATH);

  const projectsToHandle = gConfigContent.dotfiles.map(projectHandler);

  const runResults = await Promise.allSettled(projectsToHandle).then((projectsResults: ProjectRunResults[]) => {
    return projectsResults.map(getProjectRunResults).flat();
  });

  presentProjectResults(runResults);

  } catch (err) {
    logger.error(err);
    logger.error('Exiting...');
    process.exit(err.errno);
  }
})();

function getFilePathFromCliArgs(args: Array<string>): string {
  const usefulStrings = args.slice(2);
  if (usefulStrings.length) {
    return usefulStrings[0] as string;
  }
  return '';
}

function getProjectRunResults(runData: ProjectRunResults) {
  if (runData.status == 'fulfilled') {
      return (runData as PromiseFulfilledResult<ConfigurationRunResult[]>).value.map(getConfigurationRunResults)
  }

  return (runData as PromiseRejectedResult).reason;
}

function getConfigurationRunResults(runData: ConfigurationRunResult) {
  if (runData.status === 'fulfilled') {
    return runData.value;
  }

  return runData.reason;
}

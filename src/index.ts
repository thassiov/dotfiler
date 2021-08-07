#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import projectHandler from './project-handler/index';
import { presentProjectResults } from './utils/presentation';
import logger from './utils/logger';
import { ILocalConfigurationOperationDetails } from './definitions';
import { getBaseFromFilePath } from './utils/fs';
import { getActionFromCli } from './cli';

type ConfigurationRunResult = PromiseSettledResult<ILocalConfigurationOperationDetails>;

type Actions = {
  dotfiler: (path: string) => Promise<void>,
  generateConfig: (path: string) => Promise<void>,
}

const actions: Actions = {
  dotfiler: async (path: string) => doTheDotfilerStuff(path),
  generateConfig: async (path: string) => generateADotfilerConfig(path),
};

(async() => {
  try {
    const [ action, parameter ] = getActionFromCli();
    await actions[action as keyof Actions](parameter);
  } catch (err) {
    logger.error(err);
    logger.error('Exiting...');
    process.exit(err.errno);
  }
})();

function getConfigurationRunResults(runData: ConfigurationRunResult) {
  if (runData.status === 'fulfilled') {
    return runData.value;
  }

  return runData.reason;
}

async function doTheDotfilerStuff(projectPath: string): Promise<void> {
    const projectResults: ConfigurationRunResult[] = await projectHandler({ name: getBaseFromFilePath(projectPath), location: projectPath });
    presentProjectResults(projectResults.map(getConfigurationRunResults));
}

async function generateADotfilerConfig(projectPath: string): Promise<void> {
  projectPath;
  return Promise.resolve();
}

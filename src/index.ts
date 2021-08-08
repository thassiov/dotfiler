#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import projectHandler, { Settled } from './project-handler/index';
import { presentProjectResults } from './utils/presentation';
import logger from './utils/logger';
import { getBaseFromFilePath } from './utils/fs';
import { getActionFromCli } from './cli';
import { ILocalConfigurationOperationDetails } from './definitions';

(async() => {
  try {
    const [ action, parameter ] = getActionFromCli();

    switch (action) {
      case 'generateConfig':
        await generateADotfilerConfig(parameter as string);
        break;
      case 'dotfiler':
        await doTheDotfilerStuff(parameter as string[]);
        break;
      default:
        console.error('(☞ﾟヮﾟ)☞ ┻━┻');
        break;
    }
    // await actions[action as keyof Actions](parameter as a);
  } catch (err) {
    logger.error(err);
    logger.error('Exiting...');
    process.exit(err.errno);
  }
})();

async function doTheDotfilerStuff(projectPaths: string[]): Promise<void> {
  if (!projectPaths.length) {
    throw new Error('No path to project provided');
  }

  const results = await Promise.allSettled(
    projectPaths.map(projectPath => projectHandler({ name: getBaseFromFilePath(projectPath), location: projectPath }))
  ).then(results => results.map((result: Settled) =>  result.value ? result.value : result.reason))
  .then(results => results.flat());

  const flatResults = results.flat();

  const projectResults = flatResults.filter(r => !(r instanceof Error)) as ILocalConfigurationOperationDetails[];
  const projectErrors = flatResults.filter(r => (r instanceof Error)) as Error[];

  presentProjectResults(projectResults, projectErrors);
}

async function generateADotfilerConfig(projectPath: string): Promise<void> {
  projectPath;
  return Promise.resolve();
}

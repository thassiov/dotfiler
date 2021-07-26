#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import projectHandler from './project-handler/index';
import { presentProjectResults } from './utils/presentation';
import { getGlobalConfig } from './internal';
import logger from './utils/logger';

(async() => {

  const cliArgs = getFilePathFromCliArgs(process.argv);

  try {
  const gConfigContent = await getGlobalConfig(cliArgs || process.env.DOTFILER_GLOBAL_CONFIG_PATH);

  const projectsToHandle = gConfigContent.dotfiles.map(projectHandler);

  const projectResults = await Promise.allSettled(projectsToHandle);

  projectResults.forEach((project) => {
    if (project.status == 'fulfilled') {
      presentProjectResults(project.value);
    } else {
      logger.error(project.reason);
    }
  });

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

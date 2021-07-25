#!/usr/bin/env node

import projectHandler from './project-handler/index.js';
import { presentProjectResults } from './utils/presentation.js';
import { getGlobalConfig } from './internal';
import logger from './utils/logger.js';

(async() => {
  try {
  const gConfigContent = await getGlobalConfig();

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

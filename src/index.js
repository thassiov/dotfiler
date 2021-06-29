#!/usr/bin/env node

import projectHandler from './project-handler/index.js';
import { presentProjectResults } from './utils/presentation.js';
import { getGlobalConfig } from './internal';

// the start

const gConfigContent = await getGlobalConfig();

const projectsToHandle = gConfigContent.dotfiles.map(projectHandler);

const projectResults = await Promise.all(projectsToHandle);

projectResults.forEach(presentProjectResults);

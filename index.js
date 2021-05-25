import {
  dirname,
  join,
  resolve,
} from 'path';
import {
  ensureString,
  limitStringSize,
  strToJson,
} from './utils/string.js';
import logger from './utils/logger.js';
import {
  fileLoader,
  isPathOfType,
  resolveConfigDestPaths,
  createConfigSymLink,
  copyConfig,
} from './utils/fs.js';

const DEFAULT_CONFIG_FILE_NAME = '.dotfiler.json';

async function getGlobalInformation() {
  logger.debug(`[getGlobalInformation] Trying to read main config file`);
  try {
    const gConfigPath = resolve(process.env.HOME, DEFAULT_CONFIG_FILE_NAME);
    return strToJson(await fileLoader(gConfigPath));
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.debug(`[getGlobalInformation] Global information not found. Defaulting to $HOME/dotfiles`);
      return {
        dotfiles: [
          {
            name: 'main',
            location: `${process.env.HOME}/dotfiles`
          }
        ],
      };
    }
    logger.error(err);
    throw err;
  }
}

async function getProjectInformation(configPath) {
  logger.debug(`[getProjectInformation] ${configPath}`);
  return await strToJson(await fileLoader(configPath));
}

async function handleConfigSymlink(config) {
  logger.debug(`[handleConfigSymlink] ${limitStringSize(ensureString(config), 50)}`);

  if (await isPathOfType(config.dest, 'symlink')) {
    return 'present';
  }

  if (await createConfigSymLink(config)) {
    return 'created';
  }

  return 'failed';
}

async function handleConfigCopy(config) {
  logger.debug(`[handleConfigCopy] ${limitStringSize(ensureString(config), 50)}`);

  // @TODO it can be a file too, so it should be tested for if before trying to see if it is there
  if (await isPathOfType(config.dest, 'directory')) {
    // @TODO backup if the user decides to copy anyway
    return 'present';
  }

  if (await copyConfig(config)) {
    return 'created';
  }

  return 'failed';
}

async function handleConfig(config) {
  logger.debug(`[handleConfig] ${limitStringSize(ensureString(config), 50)}`);
  const result = {
    dest: config.dest,
    type: config.copy ? 'copy' : 'symlink',
    status: '',
  };

  result.status = config.copy ? await handleConfigCopy(config) : await handleConfigSymlink(config);

  // @TODO if copied, check fo checksum of something that can state a diff between the two
  return result;
}

async function handleProject(project) {
  logger.debug(`[handleProject] ${limitStringSize(ensureString(project.name || project.location), 50)}`);

  // @TODO maybe handle the case when the config path is a syn link as well, idk
  const [isFile, isDirectory] = await Promise.all([
    isPathOfType(project.location, 'file'),
    isPathOfType(project.location, 'directory'),
  ]);

  const configPath = isFile ? project.location : join(project.location, DEFAULT_CONFIG_FILE_NAME);

  const projectInfo = await getProjectInformation(configPath);

  // this figures out the config file/dir full path as it will be needed later
  const configFilePrefix = isDirectory ? project.location : dirname(project.location);

  const configsToHandle = projectInfo.configs
    .map(config => ({...config, src: join(configFilePrefix, config.src)}))
    .map(resolveConfigDestPaths)
    .map(handleConfig);

  const results = await Promise.all(configsToHandle);

  return results;
}

//// the start

const gConfigContent = await getGlobalInformation();

const projectsToHandle = gConfigContent.dotfiles.map(handleProject);

const results = await Promise.all(projectsToHandle);

logger.info(JSON.stringify(results.flat(), null, 2));

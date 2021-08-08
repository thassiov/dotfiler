const { lint, DEFAULT_SAFE_SCHEMA } = require('yaml-lint');

import {
  createLocalConfigDirectory,
  createLocalConfigFile,
  createSourceFilesBasedOnLocalConfig,
  deleteDestFilesBasedOnLocalConfig,
  deleteSourceFilesBasedOnLocalConfig,
  removeLocalConfigDirectory,
  readFileContent,
} from './utils/fs';
import { createLocalConfigObject } from './utils/mockData';
import { ILocalConfiguration } from '../src/definitions';
import generateConfig from '../src/actions';
import { yamlToJson } from '../src/utils/contentTypeConverter';

describe('Dotfiler config generator', () => {
  let projectConfig: ILocalConfiguration = { configs: [] };
  const TEST_PROJECTS_HOME = '/tmp/dotfiler-projects';
  const TEST_PROJECT_DIRECTORY = `${TEST_PROJECTS_HOME}/test-project`;
  const TEST_PROJECT_DESTINATION_DIRECTORY = `${TEST_PROJECTS_HOME}`;

  function removeTrailingSlashIfPresent(str: string): string {
    if (str.endsWith('/')) {
      return str.substring(0, str.length - 2);
    }
    return str;
  }

  // create a new project with some sample files and a config file inside
  // also generate a destination directory for the files
  async function setupTestProject(projectPath: string, numberOfFiles = 3, destinationPath?: string): Promise<void> {
    await createLocalConfigDirectory(projectPath);
    const { configs } = createLocalConfigObject(numberOfFiles, destinationPath, projectPath);
    projectConfig.configs = configs.map(({ src, dest }) => ({ src: removeTrailingSlashIfPresent(src), dest: removeTrailingSlashIfPresent(dest) }));
    await createSourceFilesBasedOnLocalConfig({ ...projectConfig, location: projectPath });
  }

  async function deleteTestProject(projectPath: string): Promise<void> {
    await deleteSourceFilesBasedOnLocalConfig({ ...projectConfig, location: projectPath });
    await deleteDestFilesBasedOnLocalConfig(projectConfig);
    await removeLocalConfigDirectory(TEST_PROJECT_DIRECTORY);
  }

  beforeEach(async () => {
    await setupTestProject(TEST_PROJECT_DIRECTORY, 10, TEST_PROJECT_DESTINATION_DIRECTORY);
  });

  afterEach(async () => {
    await deleteTestProject(TEST_PROJECT_DIRECTORY);
  });

  test('cannot create a dotfiler config: a config is already present', async () => {
    await createLocalConfigFile(projectConfig, TEST_PROJECT_DIRECTORY);
    expect(() => generateConfig(TEST_PROJECT_DIRECTORY)).rejects.toThrow(`There's a file named '.dotfiler' in this directory`);
  });

  test('creates a json dotfiler config', async () => {
    const configPath = await generateConfig(TEST_PROJECT_DIRECTORY);
    const loadedConfigFromFs = JSON.parse(await readFileContent(configPath));
    expect(loadedConfigFromFs).toHaveProperty('configs', expect.arrayContaining(projectConfig.configs));
  });

  test('creates a yaml dotfiler config', async () => {
    const configPath = await generateConfig(TEST_PROJECT_DIRECTORY, true);
    const loadedConfigFromFs = await readFileContent(configPath);

    // make sure the content is yaml
    expect(() => lint(loadedConfigFromFs, { schema: DEFAULT_SAFE_SCHEMA })).not.toThrow();

    const jsonConfig = await yamlToJson(loadedConfigFromFs);

    expect(jsonConfig).toHaveProperty('configs', expect.arrayContaining(projectConfig.configs))
  });
});

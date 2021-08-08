import { join, parse } from 'path';

import projectHandler from '../src/project-handler';
import { createLocalConfigObject } from './utils/mockData';
import {
  clearFile,
  createFileOrDirectoryFromPath,
  createLocalConfigDirectory,
  createLocalConfigFile,
  createSourceFilesBasedOnLocalConfig,
  deleteDestFilesBasedOnLocalConfig,
  deletePath,
  deleteSourceFilesBasedOnLocalConfig,
  makePathUnreadable,
  readFileContent,
  removeLocalConfigDirectory,
  writeContentToFile,
} from './utils/fs';
import { DEFAULT_CONFIG_FILE_NAME, ILocalConfiguration } from '../src/definitions';
import { jsonToYaml } from '../src/utils/contentTypeConverter';

describe('Handling projects', () => {
  let projectConfig: ILocalConfiguration;
  const TEST_PROJECTS_HOME = '/tmp/dotfiler-projects';
  const TEST_PROJECT_DIRECTORY = `${TEST_PROJECTS_HOME}/test-project`;
  const TEST_PROJECT_DESTINATION_DIRECTORY = `${TEST_PROJECT_DIRECTORY}-dest`;
  const TEST_PROJECT_CONFIG_FILE_PATH = join(TEST_PROJECT_DIRECTORY, DEFAULT_CONFIG_FILE_NAME);
  const DEFAULT_PROJECT_HANDLER_ARGUMENT = { location: TEST_PROJECT_DIRECTORY, name: 'test-project' };

  // create a new project with some sample files and a config file inside
  // also generate a destination directory for the files
  async function setupTestProject(projectPath: string, numberOfFiles = 3, destinationPath?: string): Promise<void> {
    await createLocalConfigDirectory(projectPath);
    projectConfig = createLocalConfigObject(numberOfFiles, destinationPath, projectPath);
    await createLocalConfigFile(projectConfig, projectPath);
    await createSourceFilesBasedOnLocalConfig({ ...projectConfig, location: projectPath });
  }

  async function deleteTestProject(projectPath: string): Promise<void> {
    await deleteSourceFilesBasedOnLocalConfig({ ...projectConfig, location: projectPath });
    await deleteDestFilesBasedOnLocalConfig(projectConfig);
    await removeLocalConfigDirectory(TEST_PROJECT_DIRECTORY);
  }

  afterEach(async () => {
    await deleteTestProject(TEST_PROJECT_DIRECTORY);
  });

  describe('project directory', () => {
    beforeEach(async () => {
      await setupTestProject(TEST_PROJECT_DIRECTORY, 0, TEST_PROJECT_DESTINATION_DIRECTORY);
    });

    test('cannot access project directory: does not exist', async () => {
      const config = { location: '/some/random/dir' };
      expect(() => projectHandler(config)).rejects.toThrow('ENOENT');
    });

    test.skip('cannot access project directory: does not have permission', async () => {
      await makePathUnreadable(TEST_PROJECT_DIRECTORY);
      expect(() => projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).rejects.toThrow('EACCES');
    });
  });

  describe('project configuration file', () => {
    beforeEach(async () => {
      await setupTestProject(TEST_PROJECT_DIRECTORY, 1, TEST_PROJECT_DESTINATION_DIRECTORY);
    });

    test('cannot access project configuration file: does not exist', async () => {
      await deletePath(TEST_PROJECT_CONFIG_FILE_PATH);
      expect(() => projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).rejects.toThrow('ENOENT');
    });

    test.skip('cannot access project configuration file: does not have permission', async () => {
      await makePathUnreadable(TEST_PROJECT_CONFIG_FILE_PATH);
      expect(() => projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).rejects.toThrow('ENOENT');
    });

    test('cannot read project configuration file: is empty', async () => {
      await clearFile(TEST_PROJECT_CONFIG_FILE_PATH)
      expect(() => projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).rejects.toThrow('do not follow the correct config structure');
    });

    test('cannot read project configuration file: is neither json or yaml', async () => {
      await writeContentToFile(TEST_PROJECT_CONFIG_FILE_PATH, 'this is not valid content');
      expect(() => projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).rejects.toThrow('do not follow the correct config structure');
    });

    test('project configuration file has valid yaml', async () => {
      const jsonprojectConfigtr = await readFileContent(TEST_PROJECT_CONFIG_FILE_PATH);
      const yamlprojectConfigtr = await jsonToYaml(JSON.parse(jsonprojectConfigtr));
      await writeContentToFile(TEST_PROJECT_CONFIG_FILE_PATH, yamlprojectConfigtr);
      expect(projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).resolves.toBeDefined();
    });

    test('project configuration file has valid json', async () => {
      expect(projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).resolves.toBeDefined();
    });
  });

  describe('project source file', () => {
    beforeEach(async () => {
      await setupTestProject(TEST_PROJECT_DIRECTORY, 1, TEST_PROJECT_DESTINATION_DIRECTORY);
    });

    test('cannot read source file: does not exist', async () => {
      const sourceFilePath = join(TEST_PROJECT_DIRECTORY, projectConfig.configs[0]?.src as string);
      await deletePath(sourceFilePath);
      const result = await projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT);
      expect(result[0]).toHaveProperty('status', 'failed');
    });

    test.skip('cannot read source file: does not have permission', async () => {
      const sourceFilePath = join(TEST_PROJECT_DIRECTORY, projectConfig.configs[0]?.src as string);
      await makePathUnreadable(sourceFilePath);
      expect(projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).resolves.toBeDefined();
    });

    test.each([
      { type: 'link', copy: false },
      { type: 'copy', copy: true },
    ])('cannot $type source file to destination: $type is already present', async ({ copy }) => {
      const projectConfig = JSON.parse(await readFileContent(TEST_PROJECT_CONFIG_FILE_PATH));

      // create a file in the destination
      await createFileOrDirectoryFromPath(projectConfig.configs[0].dest);

      // update project's config
      projectConfig.configs[0].copy = copy;
      await writeContentToFile(TEST_PROJECT_CONFIG_FILE_PATH, JSON.stringify(projectConfig));

      expect(projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).resolves.toBeDefined();
    });

    test.skip.each([
      { type: 'link', copy: false },
      { type: 'copy', copy: true },
    ])('cannot $type source file to destination: does not have permission', async ({ copy }) => {
      const projectConfig = JSON.parse(await readFileContent(TEST_PROJECT_CONFIG_FILE_PATH));

      // make destination's parent dir unreadable
      const destinationParentDir = parse(projectConfig.configs[0].dest).dir;
      await makePathUnreadable(destinationParentDir);

      // update project's config
      projectConfig.configs[0].copy = copy;
      await writeContentToFile(TEST_PROJECT_CONFIG_FILE_PATH, JSON.stringify(projectConfig));

      expect(projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).resolves.toBeDefined();
    });

    test.each([
      { type: 'link', copy: false },
      { type: 'copy', copy: true }
    ])('$type source file: $type is successful', async ({ copy }) => {
      const projectConfig = JSON.parse(await readFileContent(TEST_PROJECT_CONFIG_FILE_PATH));

      // update project's config
      projectConfig.configs[0].copy = copy;
      await writeContentToFile(TEST_PROJECT_CONFIG_FILE_PATH, JSON.stringify(projectConfig));

      expect(projectHandler(DEFAULT_PROJECT_HANDLER_ARGUMENT)).resolves.toBeDefined();
    });
  });
});

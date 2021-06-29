import { dirname } from 'path';

import projectHandler from '../src/project-handler';
import { DEFAULT_GLOBAL_CONFIG_OBJECT } from '../src/utils/constants';
import { createLocalConfigObject } from './utils/mock-data';
import {
  createEmptyLocalConfigFile,
  createLocalConfigFile,
  createSourceFilesBasedOnLocalConfig,
  deleteDestFilesBasedOnLocalConfig,
  deleteSourceFilesBasedOnLocalConfig,
  makeLocalConfigFileUnreadable,
  removeLocalConfigDirectory,
} from './utils/setUp';

describe('project handler', () => {
  let localConfigReference = { ...DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0] };
  let configs;

  beforeEach(async () => {
    configs = createLocalConfigObject();
    await createLocalConfigFile(configs);
    await createSourceFilesBasedOnLocalConfig({ ...configs, location: dirname(localConfigReference.location) });
  });

  afterEach(async () => {
    await deleteSourceFilesBasedOnLocalConfig({ ...configs, location: dirname(localConfigReference.location) });
    await deleteDestFilesBasedOnLocalConfig(configs);
    await removeLocalConfigDirectory();
  });

  test('project location is empty', async () => {
    const config = { ...localConfigReference, location: '' };
    expect(() => projectHandler(config)).rejects.toThrow('empty');
  });

  test('project location is an invalid path', async () => {
    const config = { ...localConfigReference, location: '2' };
    expect(() => projectHandler(config)).rejects.toThrow('ENOENT');
  });

  test('project location does not exist', async () => {
    const config = { ...localConfigReference, location: '/some/random/dir' };
    expect(() => projectHandler(config)).rejects.toThrow('ENOENT');
  });

  test('project location cannot be accessed by lack of permissions', async () => {
    await makeLocalConfigFileUnreadable();
    const config = { ...localConfigReference };
    expect(() => projectHandler(config)).rejects.toThrow('EACCES');
  });

  test('the project configuration is not json', async () => {
    await createEmptyLocalConfigFile();
    const config = { ...localConfigReference };
    expect(() => projectHandler(config)).rejects.toThrow('JSON');
  });

  test('the configuration does not follow the correct structure', async () => {
    await createLocalConfigFile({ thisisnotgoingtowork: true });
    const config = { ...localConfigReference };
    expect(() => projectHandler(config)).rejects.toThrow('array');
  });

  test('the configuration is correct', async () => {
    const config = { ...localConfigReference };
    expect(projectHandler(config)).resolves.toBeDefined();
  });
});

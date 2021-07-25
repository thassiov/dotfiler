import { DEFAULT_GLOBAL_CONFIG_OBJECT } from "../src/definitions/constants";

import {
  getGlobalConfig, getLocalConfig,
} from "../src/internal";

import {
  createEmptyLocalConfigFile,
  createGlobalConfigFile,
  createLocalConfigFile,
  makeGlobalConfigFileUnreadable,
  makeLocalConfigFileUnreadable,
  removeGlobalConfigFile,
  removeLocalConfigDirectory,
  removeLocalConfigFile,
} from "./utils/fs";

import { createLocalConfigObject } from "./utils/mockData";

describe('Internal configuration files',() => {
  afterAll(async () => {
    await removeGlobalConfigFile();
    await removeLocalConfigDirectory();
  });

  describe('global', () => {
    beforeEach(async () => {
      await createGlobalConfigFile();
    });

    afterEach(async () => {
      await removeGlobalConfigFile()
    });

    // @NOTE This is a good test case, but I don't know about changing values
    // from env vars that I do not own. I'll get back to it eventually
    test.todo('$HOME env var is not set');

    test('no permission to access the configuration', async () => {
      await makeGlobalConfigFileUnreadable();
      expect(() => getGlobalConfig()).rejects.toThrow('EACCES');
    });

    test('no global configuration found (uses default config)', async () => {
      await removeGlobalConfigFile();
      expect(getGlobalConfig()).resolves.toEqual(DEFAULT_GLOBAL_CONFIG_OBJECT);
    });

    test('global configuration found', async () => {
      const config = { ...DEFAULT_GLOBAL_CONFIG_OBJECT, name: 'test-config'};
      await createGlobalConfigFile(config);
      expect(getGlobalConfig()).resolves.toEqual(config);
    });
  });

  describe('local', () => {
    const configPath = DEFAULT_GLOBAL_CONFIG_OBJECT.dotfiles[0].location;
    beforeEach(async () => {
      await createLocalConfigFile(createLocalConfigObject(5));
    });

    afterEach(async () => {
      await removeLocalConfigDirectory();
    });

    test('the local configs directory does not exist.', async () => {
      await removeLocalConfigDirectory();
      expect(() => getLocalConfig(configPath)).rejects.toThrow('ENOENT');
    });

    test('the local config file does not exist', async () => {
      await removeLocalConfigFile();
      expect(() => getLocalConfig(configPath)).rejects.toThrow('ENOENT');
    });

    test('no permission to access the configuration', async () => {
      await makeLocalConfigFileUnreadable();
      expect(() => getLocalConfig(configPath)).rejects.toThrow('EACCES');
    });

    test('local config file does exist but is not json', async () => {
      await createEmptyLocalConfigFile();
      expect(() => getLocalConfig(configPath)).rejects.toThrow('JSON');
    });

    test('local config file does exist and can be read', async () => {
      const config = await getLocalConfig(configPath);
      expect(config).toBeDefined();
    });
  });
});

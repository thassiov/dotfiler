import { DEFAULT_GLOBAL_CONFIG_OBJECT } from "../src/definitions/constants";

import {
  getGlobalConfig,
} from "../src/internal";

import {
  createGlobalConfigFile,
  makeGlobalConfigFileUnreadable,
  removeGlobalConfigFile,
  removeLocalConfigDirectory,
} from "./utils/fs";

describe('Internal configuration files',() => {
  afterAll(async () => {
    await removeGlobalConfigFile();
    await removeLocalConfigDirectory();
  });

  describe.skip('global configuration', () => {
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
});

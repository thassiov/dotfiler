import { resolve } from 'path';

export const DEFAULT_CONFIG_FILE_NAME = '.dotfiler';

export const DEFAULT_LOCAL_CONFIG_DIRECTORY_NAME = 'dotfiles';
export const DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH = (() => resolve(process.env.HOME, DEFAULT_LOCAL_CONFIG_DIRECTORY_NAME))();
export const DEFAULT_LOCAL_CONFIG_FILE_PATH = (() => resolve(DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH, DEFAULT_CONFIG_FILE_NAME))();

export const DEFAULT_GLOBAL_CONFIG_FILE_PATH = (() => resolve(process.env.HOME, DEFAULT_CONFIG_FILE_NAME))();

export const DEFAULT_GLOBAL_CONFIG_OBJECT = {
  dotfiles: [
    {
      name: 'main',
      location: DEFAULT_LOCAL_CONFIG_FILE_PATH,
    }
  ],
};

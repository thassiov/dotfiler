import { resolve } from 'path';
import {IGlobalConfiguration} from './IGlobalConfiguration';

export const DEFAULT_CONFIG_FILE_NAME = '.dotfiler';

export const DEFAULT_LOCAL_CONFIG_DIRECTORY_NAME = '.dotfiles';
export const DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH: string = (() => resolve(process.env.HOME as string, DEFAULT_LOCAL_CONFIG_DIRECTORY_NAME))();
export const DEFAULT_LOCAL_CONFIG_FILE_PATH: string = (() => resolve(DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH, DEFAULT_CONFIG_FILE_NAME))();

export const DEFAULT_GLOBAL_CONFIG_FILE_PATH: string = (() => resolve(process.env.HOME as string, DEFAULT_CONFIG_FILE_NAME))();

export const DEFAULT_GLOBAL_CONFIG_OBJECT: IGlobalConfiguration = {
  dotfiles: [
    {
      name: 'main',
      location: DEFAULT_LOCAL_CONFIG_FILE_PATH,
    }
  ],
};

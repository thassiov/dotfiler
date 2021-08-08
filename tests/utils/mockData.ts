import faker from 'faker';
import { parse, resolve, join } from 'path';
import {normalize} from 'path/posix';
import { IGlobalConfiguration, ILocalConfiguration } from '../../src/definitions';
import { DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH } from '../../src/definitions/constants';

/**
 * Creates a mock local config object (ILocalConfiguration)
 *
 * @param numberOfTargets - number of items to create in a local configuration
 * @param alternativeDestBase - base dir that will be prepended at each `dest` property in the local configuration. If not provided, a random dir will be generated
 * @param alternativeLocalConfigDirectory - directory where the configs are read from. Serves as an alternative to `$HOME/.dotfiles`
 *
 * @returns ILocalConfiguration
 */
export function createLocalConfigObject(numberOfTargets = 3, alternativeDestBase?: string, alternativeLocalConfigDirectory?: string): ILocalConfiguration {
  if (numberOfTargets == 0) {
    return { configs: [] };
  }

  return {
    configs: Array(numberOfTargets).fill(0).map(() => {
      const copy = shouldItemBeCopied();
      const baseDestDir = parse(alternativeLocalConfigDirectory || DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH).dir;
      let dest = resolve(baseDestDir, alternativeDestBase || getSomeRandomDirectoryName());

      let src: string;

      if (shouldItemBeADirectory()) {
        // @NOTE adding this slash to represent a dir is for testing purposes only because the
        // code that generates test data needs to know if the target is a file or a dir. Poluting
        // the config with props that are only there for testing (like `isDir: true`) didn't sound
        // like a good solution.
        src = removeExtensionFromItem(faker.system.fileName()) + '/';
      } else {
        src = faker.system.fileName();

        if(!shouldItemHaveExtension()) {
          src = removeExtensionFromItem(faker.system.fileName());
        }
      }

      if (shouldItemBeHidden()) {
        src = '.' + src;
      }

      dest = join(dest, src);

      return {
        src,
        dest,
        copy
      };
    }),
  };
}

/**
 * Create a mock global config object (IGlobalConfiguration)
 *
 * @param numberOfTargets - number of items to create in a global configuration
 * @param alternativeProjectsBasePath - base path prepended at all `location` properties of each project. If not provided, a random dir will be generated
 *
 * @returns IGlobalConfiguration
 */
export function createGlobalConfigObject(numberOfTargets = 3, alternativeProjectsBasePath?: string): IGlobalConfiguration {
  return {
    dotfiles: Array(numberOfTargets).fill(0).map(() => {
      return {
        name: getSomeRandomProjectName(),
        location: normalize(join(alternativeProjectsBasePath || getSomeRandomDirectoryName(), getSomeRandomProjectName())),
      };
    }),
  };
}

function getSomeRandomDirectoryName(): string {
  const name = faker.system.directoryPath();
  // Because when it generates this directory, the tests break because of lack of permissions
  // and the program is not being executed as root to have this kind of access
  if (name.startsWith('/root')) {
    return getSomeRandomDirectoryName();
  }

  return name;
}

function getSomeRandomProjectName(): string {
  return `${faker.commerce.color()}-${faker.commerce.productName().toLowerCase().replace(/\ /g, '-')}-${faker.git.shortSha()}`;
}

function removeExtensionFromItem(target: string): string {
  return parse(target).name;
}

function shouldItemBeHidden(): boolean {
  return coinFlip();
}

function shouldItemBeCopied(): boolean {
  return coinFlip();
}

function shouldItemBeADirectory(): boolean {
  return coinFlip();
}

function shouldItemHaveExtension(): boolean {
  return coinFlip();
}

export function coinFlip(): boolean {
  const min = Math.ceil(0);
  const max = Math.floor(1000);
  const result = Math.floor(Math.random() * (max - min)) + min;
  return !!(result % 2);
}

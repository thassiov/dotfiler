import faker from 'faker';
import { parse, resolve, join } from 'path';
import {DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH} from '../../src/utils/constants';

export function createLocalConfigObject(numberOfTargets = 3) {
  return {
    configs: Array(numberOfTargets).fill(0).map(() => {
      const copy = shouldItemBeCopied();
      const baseDestDir = parse(DEFAULT_LOCAL_CONFIG_DIRECTORY_PATH).dir;
      let dest = resolve(baseDestDir, getSomeRandomDirectoryName());

      let src;

      if (shouldItemBeADirectory()) {
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

function getSomeRandomDirectoryName() {
  const name = faker.system.directoryPath();
  // Because when it generates this directory, the tests break because of lack of permissions
  // and the program is not being executed as root to have this kind of access
  if (name.startsWith('/root')) {
    return getSomeRandomDirectoryName();
  }

  return name;
}

function removeExtensionFromItem(target) {
  return parse(target).name;
}

function shouldItemBeHidden() {
  return !!coinFlip();
}

function shouldItemBeCopied() {
  return !!coinFlip();
}

function shouldItemBeADirectory() {
  return !!coinFlip();
}

function shouldItemHaveExtension() {
  return !!coinFlip();
}

function coinFlip() {
  const min = Math.ceil(0);
  const max = Math.floor(1000);
  const result = Math.floor(Math.random() * (max - min)) + min;
  return result % 2;
}

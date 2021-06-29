import {copyConfig, isPathOfType} from "../utils/fs";

export async function copy(config) {
  // @TODO it can be a file too, so it should be tested for if before trying to see if it is there
  if (await isPathOfType(config.dest, 'directory')) {
    // @TODO backup if the user decides to copy anyway
    return { status: 'present' };
  }

  const copyResult = await copyConfig(config);

  if (copyResult instanceof Error) {
    return {
      status:'failed',
      reason: copyResult.message
    };
  }

  return { status: 'created' };
}


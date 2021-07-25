import {copyConfig, doesTargetExist, isPathOfType} from "../utils/fs";

export async function copy(config) {
  if (await doesTargetExist(config.dest)) {
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
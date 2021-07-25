import {createConfigSymLink, doesTargetExist} from "../utils/fs";

export async function symlink(config) {
  if (await doesTargetExist(config.dest)) {
    return { status: 'present' };
  }

  const symlinkResult = await createConfigSymLink(config);

  if (symlinkResult instanceof Error) {
    return {
      status:'failed',
      reason: symlinkResult.message
    };
  }

  return { status: 'created' };
}


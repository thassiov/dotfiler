import {createConfigSymLink, isPathOfType} from "../utils/fs";

export async function symlink(config) {
  if (await isPathOfType(config.dest, 'symlink')) {
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


import argv from "argv";
import { normalize, resolve } from "path";

type json = {
  [key: string]: unknown
};

export function getProjectPathsFromCliArgs(args: string[]): string[] {
  const usefulStrings = args.slice(2);
  // the user want to run dotfiler in the current directory
  if (!usefulStrings.length) {
    return [process.env.PWD as string];
  }

  return usefulStrings.map((path) => {
    if (path == '.') {
      return process.env.PWD as string;
    }

    return resolve(normalize(path));
  });
}

export function getActionFromCli(): [ string, string | string[] ] {
  const { options } = getCliArgs();

  if ((options as json)['generate-config']) {
    const value = (options as json)['generate-config'];
    return [ 'generateConfig', value == '.'  ? process.env.PWD as string : value as string ];
  }

  return [ 'dotfiler', getProjectPathsFromCliArgs(process.argv) ];
}

function getCliArgs(): { [key: string]: unknown } {
  return argv.option([
    {
      name: 'generate-config',
      type: 'path',
      description: 'generates a .dotfiler config based on the contents of a given directory',
      short: 'g',
      example: 'dotfiler --generate-config=.'
    }
  ])
  .run();
}

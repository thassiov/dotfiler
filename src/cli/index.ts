import argv from "argv";
import { normalize } from "path";

type json = {
  [key: string]: unknown
};

export function getProjectPathsFromCliArgs(args: string[]): string[] {
  const usefulStrings = args.slice(2);
  // the user want to run dotfiler in the current directory;
  if (!usefulStrings.length) {
    return [process.cwd()];
  }

  return usefulStrings.map((path) => {
    if (path == '.') {
      return process.cwd();
    }

    return normalize(path);
  });
}

export function getActionFromCli(): [ string, string | string[] ] {
  const { options } = getCliArgs();

  if ((options as json)['generate-config']) {
    return [ 'generateConfig', (options as json)['generate-config'] as string ];
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
      example: 'dotfiler --generate-config .'
    }
  ])
  .run();
}

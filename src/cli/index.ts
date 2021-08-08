import argv from "argv";
import { normalize } from "path";

export function getProjectPathsFromCliArgs(args: string[]): string[] {
  const usefulStrings = args.slice(2);
  if (!usefulStrings.length) {
    return [];
  }

  return usefulStrings.map((path) => {
    if (!path || path == '.') {
      return process.cwd();
    }

    return normalize(path);
  });
}

export function getActionFromCli(): [ string, string | string[] ] {
  const { generateConfig } = getCliArgs();

  if (generateConfig != undefined) {
    return [ 'generateConfig', generateConfig == '' ? process.cwd() : generateConfig as string ];
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

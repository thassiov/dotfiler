import argv from "argv";
import { normalize } from "path";

export function getProjectPathFromCliArgs(args: Array<string>): string {
  const path = getFilePathFromCliArgs(args);

  if (!path || path == '.') {
    return process.cwd();
  }

  return normalize(path);
}

export function getFilePathFromCliArgs(args: Array<string>): string {
  const usefulStrings = args.slice(2);
  if (usefulStrings.length) {
    return usefulStrings[0] as string;
  }
  return '';
}

export function getActionFromCli(): [ string, string ] {
  const { generateConfig } = getCliArgs();

  if (generateConfig != undefined) {
    return [ 'generateConfig', generateConfig == '' ? process.cwd() : generateConfig as string ];
  }

  return [ 'dotfiler', getProjectPathFromCliArgs(process.argv) ];
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

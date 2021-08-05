import dotenv from 'dotenv';
dotenv.config();

import { ensureDir, remove } from "fs-extra";
import { writeFile } from 'fs/promises';
import {join} from 'path';

import {
  createDestinationFilesBasedOnLocalConfig,
  createGlobalConfigFile,
  createLocalConfigFile,
  createSourceFilesBasedOnLocalConfig,
  ILocalConfigurationWithBaseLocation,
  makePathUnreadable,
} from "./fs";
import {
  coinFlip,
  createGlobalConfigObject,
  createLocalConfigObject
} from "./mockData";

const GLOBAL_CONFIG_PATH = process.env.DOTFILER_GLOBAL_CONFIG_PATH as string;
const NUMBER_OF_PROJECTS = 1;
const NUMBER_OF_CONFIGS_PER_PROJECT = 6;

(async() => {
  await deleteTestData()
  .then(createTestData)
  .catch(console.error);
})();

async function createTestData() {
  const projectBasePath = `${GLOBAL_CONFIG_PATH}/projects`;

  await ensureDir(projectBasePath);

  const globalConfigObject = createGlobalConfigObject(NUMBER_OF_PROJECTS, projectBasePath);
  console.debug('[GLOBAL CONFIG] - ', JSON.stringify(globalConfigObject, null, 2));
  console.debug();

  await createGlobalConfigFile(globalConfigObject, GLOBAL_CONFIG_PATH);

  const localConfigsAndLocations: ILocalConfigurationWithBaseLocation[] = globalConfigObject.dotfiles.map((project: any) => {
    const localProject = createLocalConfigObject(NUMBER_OF_CONFIGS_PER_PROJECT, `${project.location}-dest`, project.location);
    console.debug('[LOCAL CONFIG] - ', JSON.stringify(localProject, null, 2));
    console.debug();

    return {
      ...localProject,
      location: project.location as string
    };
  });

  // this is here so I can pass the location of the created project to the application through the cli
  // see nodemon.json to see the command
  const localFile = `${process.cwd()}/.local-project-path`;
  await writeFile(localFile, localConfigsAndLocations[0]?.location as string, 'utf8');

  // first create the `.dotfiler` files inside each project (it also create the project directory)
  await createLocalConfigs(localConfigsAndLocations);
  // then create the config files inside each project
  await createLocalSources(localConfigsAndLocations);
  // populate some of the destinations with data so symlinking and copying can fail (display 'present')
  await createSomeDestinations(localConfigsAndLocations);
  // change permissions of some source files so some operations can fail
  await makeSomeSourcesUnreadable(localConfigsAndLocations);
  // change permissions of some destination directories so some operation can fail
  await makeSomeDestinationDirectoriesUnreadable(localConfigsAndLocations);

  console.log(`Test data is set at ${GLOBAL_CONFIG_PATH}`);
}

async function deleteTestData() {
  await remove(GLOBAL_CONFIG_PATH);

  console.log(`Test data at ${GLOBAL_CONFIG_PATH} has been removed`);
}

async function createLocalConfigs(localConfigs: ILocalConfigurationWithBaseLocation[]): Promise<void> {
  await Promise.all(localConfigs.map(({ location, ...configs }: ILocalConfigurationWithBaseLocation) => createLocalConfigFile(configs, location)));
}

async function createLocalSources(localConfigs: ILocalConfigurationWithBaseLocation[]): Promise<void> {
  await Promise.all(localConfigs.map((localConfig: ILocalConfigurationWithBaseLocation) => createSourceFilesBasedOnLocalConfig(localConfig)));
}

async function createSomeDestinations(localConfigs: ILocalConfigurationWithBaseLocation[]): Promise<void> {
  const destFilesToCreate = localConfigs.map(({ configs, location }) => {
    return {
      location,
      configs: configs.filter(coinFlip)
    };
  });

  await Promise.all(destFilesToCreate.map((localConfig: ILocalConfigurationWithBaseLocation) => createDestinationFilesBasedOnLocalConfig(localConfig)));
}

async function makeSomeSourcesUnreadable(localConfigs: ILocalConfigurationWithBaseLocation[]): Promise<void> {
  const sourceFilesToMakeUnreadable = localConfigs.map(({ configs, location }) => {
    return configs.filter(coinFlip).map(config => join(location, config.src));
  }).flat();

  await Promise.all(sourceFilesToMakeUnreadable.map(makePathUnreadable));
}

async function makeSomeDestinationDirectoriesUnreadable(localConfigs: ILocalConfigurationWithBaseLocation[]): Promise<void> {
  const destinationFilesToMakeUnreadable = localConfigs.map(({ configs }) => {
    return configs.filter(coinFlip).map(config => config.dest);
  }).flat();

  await Promise.all(destinationFilesToMakeUnreadable.map(makePathUnreadable));
}

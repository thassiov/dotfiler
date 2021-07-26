import dotenv from 'dotenv';
dotenv.config();

import {ensureDir, remove} from "fs-extra";

import {
  createGlobalConfigFile,
  createLocalConfigFile,
  createSourceFilesBasedOnLocalConfig,
} from "./fs";
import {
  createGlobalConfigObject,
  createLocalConfigObject
} from "./mockData";

const GLOBAL_CONFIG_PATH = process.env.DOTFILER_GLOBAL_CONFIG_PATH as string;
const NUMBER_OF_PROJECTS = 3;
const NUMBER_OF_CONFIGS_PER_PROJECT = 3;


(async() => {
  await deleteTestData().then(createTestData);
})();

async function createTestData() {
  const projectBasePath = `${GLOBAL_CONFIG_PATH}/projects`;

  await ensureDir(projectBasePath);

  const globalConfigObject = createGlobalConfigObject(NUMBER_OF_PROJECTS, projectBasePath);

  await createGlobalConfigFile(globalConfigObject, GLOBAL_CONFIG_PATH);

  const localConfigsToCreate = globalConfigObject.dotfiles.map((project: any) => {
    const localProject = createLocalConfigObject(NUMBER_OF_CONFIGS_PER_PROJECT, `${project.location}-dest`, project.location);
    return [
      createLocalConfigFile(localProject, project.location),
      createSourceFilesBasedOnLocalConfig({ ...localProject, location: project.location }),
    ];
  });

  // first create the `.dotfiler` files inside each project (it also create the project directory)
  await Promise.all(localConfigsToCreate.map((localConfig: any) => localConfig[0]));
  // then create the config files inside each project
  await Promise.all(localConfigsToCreate.map((localConfig: any) => localConfig[1]));

  console.debug(`Test data is set at ${GLOBAL_CONFIG_PATH}`);
}

async function deleteTestData() {
  await remove(GLOBAL_CONFIG_PATH);

  console.debug(`Test data at ${GLOBAL_CONFIG_PATH} has been removed`);
}

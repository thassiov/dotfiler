import {
  ConfigurationOperationStatus,
  ILocalConfigurationItem,
  ILocalConfigurationOperationResult
} from "../definitions";

import { symlinkConfig, doesTargetExist } from "../utils/fs";

export async function symlink(config: ILocalConfigurationItem): Promise<ILocalConfigurationOperationResult> {
  if (await doesTargetExist(config.dest)) {
    return { status: ConfigurationOperationStatus.PRESENT };
  }

  try {
    await symlinkConfig(config);
    return { status: ConfigurationOperationStatus.CREATED };
  } catch (error) {
    return {
      status: ConfigurationOperationStatus.FAILED,
      reason: error.message
    };
  }
}


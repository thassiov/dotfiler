import {
  ConfigurationOperationStatus,
  ILocalConfigurationItem,
  ILocalConfigurationOperationResult
} from "../definitions";

import { copyConfig, doesTargetExist } from "../utils/fs";

export async function copy(config: ILocalConfigurationItem): Promise<ILocalConfigurationOperationResult> {
  if (await doesTargetExist(config.dest)) {
    return { status: ConfigurationOperationStatus.PRESENT };
  }

  try {
    await copyConfig(config);
    return { status: ConfigurationOperationStatus.CREATED };
  } catch (error) {
    return {
      status: ConfigurationOperationStatus.FAILED,
      reason: error.message
    };
  }
}
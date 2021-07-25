export interface ILocalConfigurationItem {
  src: string;
  dest: string;
  copy?: boolean;
}

export interface ILocalConfiguration {
  configs: ILocalConfigurationItem[];
}

export enum ConfigurationOperationStatus {
  PRESENT = 'present',
  FAILED = 'failed',
  CREATED = 'created'
};

export enum ConfigurationOperationType {
  COPY = 'copy',
  SYMLINK = 'symlink',
};

export interface ILocalConfigurationOperationResult {
  status: ConfigurationOperationStatus;
  reason?: string;
}

export interface ILocalConfigurationOperationDetails extends ILocalConfigurationOperationResult, Pick<ILocalConfigurationItem, 'dest'> {
  type: ConfigurationOperationType;
}

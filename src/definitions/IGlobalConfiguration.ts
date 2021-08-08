export interface IGlobalConfigurationItem {
  name?: string;
  location: string;
}

export interface IGlobalConfiguration {
  dotfiles: IGlobalConfigurationItem[];
}

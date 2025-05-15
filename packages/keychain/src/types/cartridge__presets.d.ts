declare module '@cartridge/presets/config-loader' {
  import { ControllerConfig } from '@cartridge/presets';
  
  /**
   * Loads the index of available configs from the CDN
   * @returns Promise resolving to the list of available config names and base URL
   */
  export function getConfigsIndex(): Promise<{
    configs: string[];
    baseUrl: string;
  }>;
  
  /**
   * Loads the index of available configs from the CDN
   * @returns Promise resolving to the list of available config names
   */
  export function getAvailableConfigs(): Promise<string[]>;
  
  /**
   * Loads a specific config from the CDN
   * @param configName The name of the config to load
   * @returns Promise resolving to the loaded config or null if not found
   */
  export function loadConfig(configName: string): Promise<ControllerConfig | null>;
  
  /**
   * Loads all available configs from the CDN
   * @returns Promise resolving to a map of config names to their loaded configs
   */
  export function loadAllConfigs(): Promise<Record<string, ControllerConfig>>;
}

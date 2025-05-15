import { ControllerConfig } from "@cartridge/presets";

/**
 * Base URL for loading config files from CDN
 */
const CONFIG_BASE_URL = "https://static.cartridge.gg/presets";

/**
 * Interface for the configs index file
 */
interface ConfigsIndex {
  configs: string[];
  baseUrl: string;
}

/**
 * Loads the index of available configs from the CDN
 * @returns Promise resolving to the list of available config names and base URL
 */
export async function getConfigsIndex(): Promise<ConfigsIndex> {
  try {
    const response = await fetch(`${CONFIG_BASE_URL}/index.json`);
    if (!response.ok) {
      throw new Error(`Failed to load configs index: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading configs index:", error);
    return { configs: [], baseUrl: CONFIG_BASE_URL };
  }
}

/**
 * Loads the index of available configs from the CDN
 * @returns Promise resolving to the list of available config names
 */
export async function getAvailableConfigs(): Promise<string[]> {
  const indexData = await getConfigsIndex();
  return indexData.configs;
}

/**
 * Loads a specific config from the CDN
 * @param configName The name of the config to load
 * @returns Promise resolving to the loaded config or null if not found
 */
export async function loadConfig(
  configName: string,
): Promise<ControllerConfig | null> {
  try {
    const indexData = await getConfigsIndex();
    const baseUrl = indexData.baseUrl || CONFIG_BASE_URL;

    const response = await fetch(`${baseUrl}/${configName}/config.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to load config ${configName}: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error loading config ${configName}:`, error);
    return null;
  }
}

/**
 * Loads all available configs from the CDN
 * @returns Promise resolving to a map of config names to their loaded configs
 */
export async function loadAllConfigs(): Promise<
  Record<string, ControllerConfig>
> {
  const indexData = await getConfigsIndex();
  const availableConfigs = indexData.configs;
  const baseUrl = indexData.baseUrl || CONFIG_BASE_URL;
  const configsMap: Record<string, ControllerConfig> = {};

  await Promise.all(
    availableConfigs.map(async (configName) => {
      try {
        const response = await fetch(`${baseUrl}/${configName}/config.json`);
        if (response.ok) {
          const config = await response.json();
          configsMap[configName] = config;
        }
      } catch (error) {
        console.error(`Error loading config ${configName}:`, error);
      }
    }),
  );

  return configsMap;
}

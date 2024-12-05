import fs from "fs";
import path from "path";

const whitelabelPath = path.join(process.cwd(), "configs");
const outputPath = path.join(
  process.cwd(),
  "src/generated/controller-configs.ts",
);

function loadConfigFromJson(gamePath: string): any {
  try {
    const configPath = path.join(whitelabelPath, gamePath, "config.json");
    const configContent = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(configContent);
  } catch (error) {
    console.warn(`Failed to load config for ${gamePath}:`, error);
    return null;
  }
}

function generateConfigs() {
  const configs: Record<string, any> = {};

  try {
    const directories = fs
      .readdirSync(whitelabelPath)
      .filter((dir) =>
        fs.statSync(path.join(whitelabelPath, dir)).isDirectory(),
      )
      .sort();

    for (const dir of directories) {
      const config = loadConfigFromJson(dir);
      if (config) {
        configs[dir] = config;
      }
    }

    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate the TypeScript file
    const fileContent = `// This file is auto-generated. DO NOT EDIT IT MANUALLY.
import { ControllerConfigs } from "../";

export const configs: ControllerConfigs = ${JSON.stringify(configs, null, 2)};
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log("Successfully generated configs at:", outputPath);
  } catch (error) {
    console.error("Failed to generate configs:", error);
    process.exit(1);
  }
}

generateConfigs();

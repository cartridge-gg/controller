import fs from "fs";
import path from "path";

const outputPath = path.join(process.cwd(), "src/generated/erc20-metadata.ts");

async function main() {
  try {
    const res = await fetch("https://mainnet-api.ekubo.org/tokens");
    const data = await res.json();

    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate the TypeScript file
    const fileContent = `// This file is auto-generated. DO NOT EDIT IT MANUALLY.
import { EkuboERC20Metadata } from "../";

export const metadata: EkuboERC20Metadata[] = ${JSON.stringify(data, null, 2)};
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log("Successfully generated ERC20 metadata at:", outputPath);
    console.log(`Found ${data.length} tokens`);
  } catch (error) {
    console.log(`Failed to fetch ERC20 metadata: ${error.message}`);
    process.exit(1);
  }
}

main();

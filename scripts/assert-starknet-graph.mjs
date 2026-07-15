import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const expected = "10.0.2";
const listing = execFileSync(
  "pnpm",
  ["-r", "list", "starknet", "--depth", "Infinity"],
  { encoding: "utf8" },
);
const versions = [
  ...listing.matchAll(/(?<![\/@\w-])starknet (\d+\.\d+\.\d+)/g),
].map((match) => match[1]);
if (versions.length === 0 || versions.some((version) => version !== expected)) {
  throw new Error(
    `Expected only Starknet.js ${expected}, found: ${[...new Set(versions)].join(", ") || "none"}`,
  );
}

const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
const starknetOverride =
  rootPackage.pnpm?.overrides?.starknet ?? rootPackage.overrides?.starknet;
if (starknetOverride !== expected) {
  throw new Error(`Root Starknet.js override must remain pinned to ${expected}`);
}

const legacyReact = spawnSync(
  "git",
  ["grep", "-n", "@starknet-react/", "--", "**/package.json"],
  { encoding: "utf8" },
);
if (legacyReact.status === 0) {
  throw new Error(`Legacy @starknet-react dependencies remain:\n${legacyReact.stdout}`);
}

console.log(`Dependency graph contains only Starknet.js ${expected}`);

const coordinatedListing = execFileSync(
  "pnpm",
  [
    "-r",
    "list",
    "@cartridge/arcade",
    "@dojoengine/core",
    "@dojoengine/grpc",
    "@dojoengine/sdk",
    "@starknet-react/core",
    "--depth",
    "Infinity",
  ],
  { encoding: "utf8" },
);
for (const [packageName, version] of Object.entries({
  "@cartridge/arcade": "0.4.0",
  "@dojoengine/core": "2.0.0",
  "@dojoengine/grpc": "2.0.0",
  "@dojoengine/sdk": "2.0.0",
})) {
  const escapedName = packageName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const resolved = [
    ...coordinatedListing.matchAll(
      new RegExp(`${escapedName} (\\d+\\.\\d+\\.\\d+)`, "g"),
    ),
  ].map((match) => match[1]);
  if (resolved.length === 0 || resolved.some((candidate) => candidate !== version)) {
    throw new Error(
      `Expected only ${packageName} ${version}, found: ${[...new Set(resolved)].join(", ") || "none"}`,
    );
  }
}
if (coordinatedListing.includes("@starknet-react/")) {
  throw new Error("Legacy @starknet-react packages remain in the dependency graph");
}

console.log("Arcade 0.4.0 and Dojo.js 2 dependency graph is exact");

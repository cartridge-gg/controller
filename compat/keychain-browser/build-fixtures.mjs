import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const artifacts = path.join(here, ".artifacts");
const sandbox = path.join(artifacts, "sandbox");
const candidate = path.join(artifacts, "candidate-package");
const packs = path.join(artifacts, "packs");
const alphaVersion = "0.14.0-alpha.1";

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    ...options,
  });

rmSync(artifacts, { recursive: true, force: true });
mkdirSync(candidate, { recursive: true });
mkdirSync(packs, { recursive: true });
mkdirSync(sandbox, { recursive: true });

run("pnpm", ["--filter", "@cartridge/controller...", "build:deps"]);

const sourcePackage = JSON.parse(
  readFileSync(path.join(root, "packages/controller/package.json"), "utf8"),
);
sourcePackage.version = alphaVersion;
sourcePackage.files = ["dist"];
sourcePackage.scripts = {};
delete sourcePackage.devDependencies;
delete sourcePackage.repository;
for (const [name, value] of Object.entries(sourcePackage.dependencies)) {
  if (value !== "catalog:") continue;
  const replacements = {
    "@cartridge/controller-wasm": "0.10.1",
    "@cartridge/penpal": "^6.2.4",
    "@starknet-io/types-js": "0.10.2",
    starknet: "10.0.2",
  };
  sourcePackage.dependencies[name] = replacements[name];
}
writeFileSync(
  path.join(candidate, "package.json"),
  `${JSON.stringify(sourcePackage, null, 2)}\n`,
);
cpSync(
  path.join(root, "packages/controller/dist"),
  path.join(candidate, "dist"),
  {
    recursive: true,
  },
);

function replaceVersion(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      replaceVersion(target);
    } else if (/\.(?:js|cjs|mjs|map|d\.ts)$/.test(entry.name)) {
      const contents = readFileSync(target, "utf8");
      writeFileSync(target, contents.replaceAll("0.13.13", alphaVersion));
    }
  }
}
replaceVersion(path.join(candidate, "dist"));

const packOutput = execFileSync(
  "npm",
  ["pack", "--pack-destination", packs, "--json"],
  { cwd: candidate, encoding: "utf8" },
);
const [{ filename }] = JSON.parse(packOutput);
const candidateTarball = path.join(packs, filename);

writeFileSync(
  path.join(sandbox, "package.json"),
  `${JSON.stringify({ name: "controller-browser-contract-sandbox", private: true }, null, 2)}\n`,
);
run(
  "npm",
  [
    "install",
    "--prefix",
    sandbox,
    "--no-package-lock",
    "--ignore-scripts",
    "--legacy-peer-deps",
    "controller-01312@npm:@cartridge/controller@0.13.12",
    "controller-01313@npm:@cartridge/controller@0.13.13",
    `controller-candidate@file:${candidateTarball}`,
  ],
  { cwd: sandbox },
);

const readAliasPackage = (alias) =>
  JSON.parse(
    readFileSync(
      path.join(sandbox, "node_modules", alias, "package.json"),
      "utf8",
    ),
  );

assert.equal(readAliasPackage("controller-01312").version, "0.13.12");
assert.equal(readAliasPackage("controller-01313").version, "0.13.13");
const candidatePackage = readAliasPackage("controller-candidate");
assert.equal(candidatePackage.version, alphaVersion);
assert.equal(candidatePackage.dependencies.starknet, "10.0.2");

run("pnpm", [
  "--filter",
  "@cartridge/keychain",
  "exec",
  "vite",
  "build",
  "--config",
  path.join(root, "packages/keychain/vite.config.ts"),
  "--mode",
  "compatibility",
]);

for (const [id, alias] of [
  ["0.13.12", "controller-01312"],
  ["0.13.13", "controller-01313"],
  [alphaVersion, "controller-candidate"],
]) {
  run(
    "pnpm",
    [
      "--filter",
      "@cartridge/keychain",
      "exec",
      "vite",
      "build",
      "--config",
      path.join(here, "vite.host.config.ts"),
    ],
    {
      env: {
        ...process.env,
        COMPAT_SDK_ALIAS: alias,
        COMPAT_SDK_VERSION: id,
        COMPAT_HOST_OUT_DIR: path.join(artifacts, "hosts", id),
      },
    },
  );
}

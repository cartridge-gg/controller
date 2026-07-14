import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const expectedStarknet = "10.0.2";
const importAssertion = `
  Promise.all([
    import("@cartridge/controller"),
    import("@cartridge/controller/react"),
    import("@cartridge/controller/session"),
    import("@cartridge/controller/session/node"),
    import("@cartridge/connector"),
    import("@cartridge/connector/controller"),
    import("@cartridge/connector/session"),
    import("starknet"),
  ]).then(([, , , , , , , starknet]) => {
    if (!starknet.RpcProvider) throw new Error("Starknet.js import failed");
  });
`;
if (Number(process.versions.node.split(".")[0]) < 22) {
  throw new Error("Packed consumer validation requires Node.js 22 or newer");
}

const root = process.cwd();
const temporary = mkdtempSync(join(tmpdir(), "controller-packed-"));
const packs = join(temporary, "packs");
mkdirSync(packs);

try {
  for (const packageDirectory of [
    "packages/controller",
    "packages/connector",
  ]) {
    run(
      "pnpm",
      ["pack", "--pack-destination", packs],
      join(root, packageDirectory),
    );
  }

  const tarballs = readdirSync(packs).map((name) => join(packs, name));
  const controller = tarballs.find((path) =>
    path.includes("cartridge-controller-"),
  );
  const connector = tarballs.find((path) =>
    path.includes("cartridge-connector-"),
  );
  if (!controller || !connector)
    throw new Error("Expected Controller package tarballs were not produced");

  for (const manager of ["npm", "pnpm", "bun"]) {
    const consumer = join(temporary, manager);
    mkdirSync(consumer);
    const packageJson = {
      name: `controller-${manager}-consumer`,
      private: true,
      type: "module",
      dependencies: {
        "@cartridge/controller": `file:${controller}`,
        "@cartridge/connector": `file:${connector}`,
        "@starknet-start/react": "1.0.8",
        react: "19.2.4",
        "react-dom": "19.2.4",
        starknet: expectedStarknet,
      },
      overrides: {
        "@cartridge/controller": `file:${controller}`,
        starknet: expectedStarknet,
      },
      pnpm: {
        overrides: {
          "@cartridge/controller": `file:${controller}`,
          starknet: expectedStarknet,
        },
      },
    };
    writeFileSync(
      join(consumer, "package.json"),
      `${JSON.stringify(packageJson, null, 2)}\n`,
    );

    if (manager === "npm") run("npm", ["install"], consumer);
    if (manager === "pnpm")
      run("pnpm", ["install", "--strict-peer-dependencies"], consumer);
    if (manager === "bun") run("bun", ["install"], consumer);

    const command = manager === "bun" ? "bun" : "node";
    run(command, ["-e", importAssertion], consumer);
    assertOneStarknet(manager, consumer);
  }

  console.log(
    `Packed npm, pnpm, and Bun consumers use Starknet.js ${expectedStarknet}`,
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

function assertOneStarknet(manager, cwd) {
  let output;
  if (manager === "npm")
    output = execFileSync("npm", ["ls", "starknet", "--all"], {
      cwd,
      encoding: "utf8",
    });
  if (manager === "pnpm")
    output = execFileSync("pnpm", ["list", "starknet", "--depth", "Infinity"], {
      cwd,
      encoding: "utf8",
    });
  if (manager === "bun")
    output = execFileSync("bun", ["pm", "ls", "--all"], {
      cwd,
      encoding: "utf8",
    });

  const versions = [
    ...output.matchAll(/(?<![\/@\w-])starknet(?:@|\s)(\d+\.\d+\.\d+)/g),
  ].map((match) => match[1]);
  if (
    versions.length === 0 ||
    versions.some((version) => version !== expectedStarknet)
  ) {
    throw new Error(
      `${manager} resolved unexpected Starknet.js versions: ${versions.join(", ") || "none"}`,
    );
  }

  const physicalPackages = execFileSync(
    "find",
    ["node_modules", "-type", "d", "-name", "starknet", "-print"],
    { cwd, encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean)
    .filter((path) => !path.includes("/@scure/starknet"))
    .map((path) => realpathSync(join(cwd, path)));
  const uniquePackages = [...new Set(physicalPackages)];
  if (uniquePackages.length !== 1) {
    throw new Error(
      `${manager} installed ${uniquePackages.length} physical Starknet.js packages:\n${uniquePackages.join("\n")}`,
    );
  }
}

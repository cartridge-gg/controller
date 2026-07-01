// Precompiles the drop-in stylesheet for `@cartridge/controller/react/styles.css`.
//
// Runs the Tailwind CLI (which loads the cartridge preset via jiti — the preset
// imports `tailwindcss/defaultTheme`, which only resolves under CJS-style
// resolution, not raw Node ESM, so we must NOT import the preset directly here).
//
// The generated CSS contains, in one pass:
//   1. the theme `:root` custom properties (controller-ui themes/default.css),
//      which the toast utilities reference (bg-background, text-foreground, …);
//   2. Tailwind components/utilities, scanned against the BUNDLED ui chunk
//      (dist/react/index.js) so only classes actually shipped by
//      <ControllerToaster /> are emitted.
//
// Preflight is disabled in tailwind.ui.config.mjs: this is a component
// stylesheet meant to drop into an existing app, so it must NOT reset the host
// page. Tailwind still emits the `--tw-*` defaults (shadows/transforms work).
//
// Runs after the Vite browser build (which produces dist/react/index.js) — see the
// `build:deps` script. Output: dist/react/styles.css.
import { execFileSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdtempSync,
} from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");

const bundle = resolve(pkgRoot, "dist/react/index.js");
if (!existsSync(bundle)) {
  console.error(
    `[build-react-styles] ${bundle} not found — run \`pnpm build:browser\` first.`,
  );
  process.exit(1);
}

// Theme `:root` variables — single source of truth: controller-ui default.css.
let themePath;
try {
  themePath = require.resolve("@cartridge/controller-ui/themes/default.css");
} catch {
  themePath = resolve(
    pkgRoot,
    "node_modules/@cartridge/controller-ui/dist/themes/default.css",
  );
}
const theme = readFileSync(themePath, "utf8");

// Inline the theme ahead of the @tailwind directives so its :root vars are
// processed into the base layer in the same pass (no separate cascade layer).
const inputDir = mkdtempSync(join(tmpdir(), "controller-ui-styles-"));
const input = join(inputDir, "input.css");
writeFileSync(
  input,
  `${theme}\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`,
);

const out = resolve(pkgRoot, "dist/react/styles.css");
const tailwindCli = resolve(
  dirname(require.resolve("tailwindcss/package.json")),
  "lib/cli.js",
);

execFileSync(
  process.execPath,
  [
    tailwindCli,
    "-c",
    resolve(pkgRoot, "tailwind.ui.config.mjs"),
    "-i",
    input,
    "-o",
    out,
    "--minify",
  ],
  { cwd: pkgRoot, stdio: "inherit" },
);

// Load Inter from Google Fonts — the toasts default to `font-family: Inter`
// (with a generic sans-serif fallback). A CSS `@import` must be the very first
// statement in the file, so prepend it to the generated output.
const interImport =
  '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap");\n';
writeFileSync(out, interImport + readFileSync(out, "utf8"));

console.log(`[build-react-styles] wrote ${out}`);

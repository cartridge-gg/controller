import typescript from "rollup-plugin-typescript2";
import replace from "@rollup/plugin-replace";

import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "es",
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    replace({
      preventAssignment: true,
      "process.env.BASE_URL": process.env.BASE_URL,
      "process.env.ORIGIN": process.env.ORIGIN,
    }),
    typescript({
      typescript: require("typescript"),
    }),
  ],
};

import { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["js", "ts"],
};

export default config;

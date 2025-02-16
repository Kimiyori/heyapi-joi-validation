import type { Config } from "jest";

export default async (): Promise<Config> => ({
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",

    "^@/compiler/(.*)$": "<rootDir>/src/compiler/$1"
  }
});
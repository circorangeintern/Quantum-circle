import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js", "json"],

  transformIgnorePatterns: ["node_modules/(?!(nanoid)/)"],

  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
  },

  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
    "!src/app.ts",
    "!src/core/models/**",
    "!src/core/config/**",
    "!src/core/constants/**",
    "!src/core/types/**",
  ],

  coverageReporters: ["text", "lcov", "html"],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  testTimeout: 30000,
  maxWorkers: "50%",
  verbose: true,
};

export default config;


export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  collectCoverage: true,
  coverageReporters: ["json", "html"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true
      }
    ]
  },
};

module.exports = {
  roots: [
    '<rootDir>/src/server'
  ],
  testMatch: [
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
    '**/__tests__/**/*.+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        sourceMap: true,
        inlineSourceMap: true,
      },
    },
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 45000
}
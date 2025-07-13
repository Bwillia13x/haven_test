module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  testMatch: [
    '<rootDir>/client/src/**/*.test.{ts,tsx}',
    '<rootDir>/server/**/*.test.{ts,tsx}',
    '<rootDir>/shared/**/*.test.{ts,tsx}'
  ],
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    'server/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(three|@react-three|zustand)/)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        types: ['jest', 'node', '@testing-library/jest-dom']
      }
    }
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
};

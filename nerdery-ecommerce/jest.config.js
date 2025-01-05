module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // coverageDirectory: '<rootDir>/coverage',
  // collectCoverageFrom: ['**/*.spec.(t|j)s'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

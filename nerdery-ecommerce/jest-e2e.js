// {
//   "moduleFileExtensions": ["js", "json", "ts"],
//   "rootDir": ".",
//   "testEnvironment": "node",
//   "testRegex": ".e2e-spec.ts$",
//   "transform": {
//     "^.+\\.(t|j)s$": "ts-jest"
//   }
// }

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // coverageDirectory: '<rootDir>/coverage',
  // collectCoverageFrom: ['**/*.spec.(t|j)s'],
  testRegex: '.e2e-spec.ts$',
  rootDir: '.',

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/.*\\.module\\.ts$',
    '<rootDir>/.*\\.input\\.ts$',
    '<rootDir>/.*\\.dto\\.ts$',
    '<rootDir>/.*\\.controller\\.ts$',
    '<rootDir>/.*\\.resolver\\.ts$',
    '<rootDir>/.*\\.enum\\.ts$',
  ],
  // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

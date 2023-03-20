// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('./jest.config.base');

module.exports = Object.assign({}, baseConfig, {
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^react-cascade-component$': '<rootDir>/src/index.ts',
  },
  testEnvironment: 'jsdom',
});

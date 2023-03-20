/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('./jest.config.base');

let mappedModule = '<rootDir>/dist/react-cascade-component.js';
switch (process.env.TEST_ENV) {
  case 'cjs':
    mappedModule = '<rootDir>/dist/react-cascade-component.cjs.js';
    break;
  case 'esm':
    mappedModule = '<rootDir>/dist/react-cascade-component.esm.js';
    break;
  default:
    mappedModule = '<rootDir>/dist/react-cascade-component.js';
}

module.exports = Object.assign({}, baseConfig, {
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^react-cascade-component': mappedModule,
  },
  testEnvironment: 'jsdom',
});

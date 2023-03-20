import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' assert { type: 'json' };

/**
 * NODE_ENV explicit replacement is only needed for standalone packages, as webpack
 * automatically will replace it otherwise in the downstream build.
 */

const cjs = {
  exports: 'named',
  interop: 'auto',
  format: 'cjs',
  sourcemap: true,
};

const esm = {
  format: 'esm',
  interop: 'auto',
  sourcemap: true,
};

const getCJS = (override) => ({ ...cjs, ...override });
const getESM = (override) => ({ ...esm, ...override });

const commonPlugins = [
  typescript({
    // The build breaks if the tests are included by the typescript plugin.
    // Since un-excluding them in tsconfig.json, we must explicitly exclude them
    // here.
    exclude: ['**/*.test.ts', '**/*.test.tsx', 'dist'],
    outputToFilesystem: true,
    tsconfig: './tsconfig.json',
  }),
  nodeResolve(),
  commonjs({
    esmExternals: false,
    ignoreGlobal: true,
  }),
  replace({
    __VERSION__: JSON.stringify(pkg.version),
    preventAssignment: true,
  }),
  /** @type {import('rollup').Plugin} */
  ({
    name: 'postprocessing',
    // Rollup 2 injects globalThis, which is nice, but doesn't really make sense for Microbundle.
    // Only ESM environments necessitate globalThis, and UMD bundles can't be properly loaded as ESM.
    // So we remove the globalThis check, replacing it with `this||self` to match Rollup 1's output:
    renderChunk(code, chunk, opts) {
      if (opts.format === 'umd') {
        // minified:
        code = code.replace(
          /([a-zA-Z$_]+)="undefined"!=typeof globalThis\?globalThis:(\1\|\|self)/,
          '$2'
        );
        // unminified:
        code = code.replace(
          /(global *= *)typeof +globalThis *!== *['"]undefined['"] *\? *globalThis *: *(global *\|\| *self)/,
          '$1$2'
        );
        return { code, map: null };
      }
    },
  }),
];

// this should always be last
const minifierPlugin = terser({
  compress: {
    passes: 10,
    keep_infinity: true,
    pure_getters: true,
  },
  ecma: 5,
  format: {
    wrap_func_args: false,
    comments: /^\s*([@#]__[A-Z]+__\s*$|@cc_on)/,
    preserve_annotations: true,
  },
});

const globals = { react: 'React', 'react-dom': 'ReactDOM' };

const configBase = {
  input: './src/index.ts',

  // \0 is rollup convention for generated in memory modules
  external: Object.keys(globals),
  plugins: commonPlugins,
};

const standaloneBaseConfig = {
  ...configBase,
  output: {
    file: 'dist/react-cascade-component.js',
    format: 'umd',
    globals,
    name: 'styled',
    sourcemap: true,
  },
  plugins: configBase.plugins.concat(
    replace({
      __SERVER__: JSON.stringify(false),
      preventAssignment: true,
    })
  ),
  treeshake: {
    propertyReadSideEffects: false,
  },
};

const standaloneConfig = {
  ...standaloneBaseConfig,
  plugins: standaloneBaseConfig.plugins.concat(
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
      preventAssignment: true,
    })
  ),
};

const standaloneProdConfig = {
  ...standaloneBaseConfig,
  output: {
    ...standaloneBaseConfig.output,
    file: 'dist/react-cascade-component.min.js',
  },
  plugins: standaloneBaseConfig.plugins.concat(
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    minifierPlugin
  ),
};

const serverConfig = {
  ...configBase,
  output: [
    getESM({ file: 'dist/react-cascade-component.esm.js' }),
    getCJS({ file: 'dist/react-cascade-component.cjs.js' }),
  ],
  plugins: configBase.plugins.concat(
    replace({
      window: undefined,
      __SERVER__: JSON.stringify(true),
      preventAssignment: true,
    }),
    minifierPlugin
  ),
};

const browserConfig = {
  ...configBase,
  output: [
    getESM({ file: 'dist/react-cascade-component.browser.esm.js' }),
    getCJS({ file: 'dist/react-cascade-component.browser.cjs.js' }),
  ],
  plugins: configBase.plugins.concat(
    replace({
      __SERVER__: JSON.stringify(false),
      preventAssignment: true,
    }),
    minifierPlugin
  ),
};

export default [
  standaloneConfig,
  standaloneProdConfig,
  serverConfig,
  browserConfig,
];

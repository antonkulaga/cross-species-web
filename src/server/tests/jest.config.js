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
        "types": ["graphdb/lib/types", "jest", "@types/jest"],                      /* Specify type package names to be included without being referenced in a source file. */
        "downlevelIteration": true,
        "inlineSourceMap": true,
        "incremental": true,                              /* Enable incremental compilation */
        "target": "ES2021",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
        "jsx": "react",
        "experimentalDecorators": true,                   /* Enable experimental support for TC39 stage 2 draft decorators. */
        "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
        "noLib": false,                                      /* Disable including any library files, including the default lib.d.ts. */
        "module": "commonjs",                                /* Specify what module code is generated. */
        "allowJs": true,                                  /* Allow JavaScript files to be a part of your program. Use the `checkJS` option to get errors from these files. */
        "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
        "allowSyntheticDefaultImports": true,             /* Allow 'import x from y' when a module doesn't have a default export. */
        "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables `allowSyntheticDefaultImports` for type compatibility. */
        "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */
        "strict": true,                                      /* Enable all strict type-checking options. */
        "noImplicitAny": false,                            /* Enable error reporting for expressions and declarations with an implied `any` type.. */
        "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */
      },
    },
  },
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testTimeout: 45000
}
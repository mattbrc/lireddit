import type { CodegenConfig } from '@graphql-codegen/cli';
 
const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:4000/graphql",
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/gen/": {
      preset: 'client',
      plugins: ['typescript-urql'],
      config: {
        withHooks: true,
      },
    },
  },
};
export default config;
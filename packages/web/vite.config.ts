import { defineConfig } from 'vite'
import { getAliases } from 'vite-aliases'
import { svelte } from '@sveltejs/vite-plugin-svelte';

const aliases = getAliases();
const preprocess = require('svelte-preprocess')


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte({ preprocess: preprocess() })],
  publicDir: './assets/',
  build: {
    outDir: './public/'
  },
  resolve: {
    alias: aliases
  },
  optimizeDeps: { exclude: ["@roxi/routify", "@urql/svelte"] },
})

import { vitePreprocess } from '@astrojs/svelte';

export default {
  preprocess: vitePreprocess()
  // By removing strict runes: true, Svelte 5 will auto-detect our Runes
  // but allow legacy NPM packages like Lucide to compile without crashing.
};
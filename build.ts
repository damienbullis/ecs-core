import { build } from 'bun';

await build({
	entrypoints: ['./src/main.ts'],
	outdir: './dist',
	naming: 'systems-core.js',
});

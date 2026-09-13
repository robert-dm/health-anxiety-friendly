import { build } from 'esbuild';
import fs from 'node:fs/promises';
await fs.rm('dist', {recursive:true,force:true});
await fs.mkdir('dist/server',{recursive:true});
await build({entryPoints:['src/worker.js'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'neutral',target:'es2022',external:['node:*'],conditions:['workerd','worker','browser'],minify:false});
await fs.cp('public','dist/client',{recursive:true});
await fs.mkdir('dist/.openai',{recursive:true});
await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await fs.cp('drizzle','dist/.openai/drizzle',{recursive:true});

console.log('Worker, public assets and schema migrations prepared.');

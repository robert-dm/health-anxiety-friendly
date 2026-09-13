import { build } from 'esbuild';
import fs from 'node:fs/promises';
await fs.rm('dist', {recursive:true,force:true});
await fs.mkdir('dist/server',{recursive:true});
await build({entryPoints:['src/worker.js'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'neutral',target:'es2022',external:['node:*'],conditions:['workerd','worker','browser'],minify:false});
await fs.cp('public','dist/client',{recursive:true});
await fs.mkdir('dist/.openai',{recursive:true});
await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await fs.cp('drizzle','dist/.openai/drizzle',{recursive:true});
// ChatGPT Sites applies SQL migrations from dist/.openai/drizzle to the bound D1 database.
// Keep curated production data as a separate idempotent migration after the schema migration.
await fs.copyFile('src/db/migrations/003_curated_directory.sql','dist/.openai/drizzle/0001_curated_directory.sql');
console.log('Worker, public assets and schema migrations prepared.');

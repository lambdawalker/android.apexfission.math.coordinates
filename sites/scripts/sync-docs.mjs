import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rewriteMarkdown } from './markdown.mjs';
const site = resolve(fileURLToPath(new URL('..', import.meta.url))), repo = resolve(site, '..');
execFileSync('android-repo-docs',['check'],{cwd:repo,stdio:'inherit'});
const pages = {'source-reference':['source-reference','Source declarations'],index:['agents','Agent integration'],quickstart:['getting-started','First transformation'],api:['reference','API reference'],concepts:['concepts','Coordinate spaces'],recipes:['task-recipes','Recipes and demos'],limitations:['limitations','Limitations'],troubleshooting:['troubleshooting','Troubleshooting'],migration:['migration','Version scope']};
async function write(path, text) { await mkdir(dirname(path), {recursive:true}); await writeFile(path,text); }
// This directory is entirely generated; deletion prevents stale pages and raw mirrors.
await rm(resolve(site,'src/content/docs'),{recursive:true,force:true});
await rm(resolve(site,'public/agents'),{recursive:true,force:true});
for (const [file,[slug,title]] of Object.entries(pages)) {
 const source = `docs/agents/${file}.md`;
 let content = await readFile(resolve(repo,source),'utf8');
 await write(resolve(site,`public/agents/${file}.md`),rewriteMarkdown(content,source));
 await write(resolve(site,`src/content/docs/${slug}.md`),`---\ntitle: ${title}\n---\n\n`+rewriteMarkdown(content.replace(/^# [^\n]+\n/,''),source,'human'));
}
for (const [source,slug,title] of [['IMPORT.md','installation','Installation'],['docs/documentation.md','development','Documentation maintenance'],['docs/releases.md','releases','Build and release'],['docs/site-home.md','index','Apexfission Coordinates']]) {
 const content = await readFile(resolve(repo,source),'utf8');
 await write(resolve(site,`src/content/docs/${slug}.md`),`---\ntitle: ${title}\n---\n\n`+rewriteMarkdown(content.replace(/^# [^\n]+\n/,''),source,'human'));
 if (source === 'IMPORT.md') await write(resolve(site,'public/IMPORT.md'),rewriteMarkdown(content,source));
}

if (!process.argv.includes('--check')) await import('./sync-versioned.mjs');

import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rewriteMarkdown } from './markdown.mjs';
const site = resolve(fileURLToPath(new URL('..', import.meta.url))), repo = resolve(site, '..');
const pages = {index:['agents','Agent integration'],quickstart:['getting-started','First transformation'],api:['reference','API reference'],concepts:['concepts','Coordinate spaces'],recipes:['task-recipes','Recipes and demos'],limitations:['limitations','Limitations'],troubleshooting:['troubleshooting','Troubleshooting'],migration:['migration','Version scope']};
async function write(path, text) { await mkdir(dirname(path), {recursive:true}); await writeFile(path,text); }
// This directory is entirely generated; deletion prevents stale pages and raw mirrors.
await rm(resolve(site,'src/content/docs'),{recursive:true,force:true});
await rm(resolve(site,'public/agents'),{recursive:true,force:true});
for (const [file,[slug,title]] of Object.entries(pages)) {
 const source = `docs/agents/${file}.md`;
 let content = await readFile(resolve(repo,source),'utf8');
 if (file === 'quickstart') {
  const kotlin = await readFile(resolve(repo,'src/test/java/com/apexfission/android/math/examples/DocumentationExamplesTest.kt'),'utf8');
  const match = kotlin.match(/\/\/ docs:quickstart:start\n([\s\S]*?)\/\/ docs:quickstart:end/);
  if (!match) throw new Error('Missing executable quickstart markers');
  const imports = 'import com.apexfission.android.math.models.*\nimport com.apexfission.android.math.transformations.translate\n\n';
  const expanded = content.replace(/<!-- example:start -->[\s\S]*?<!-- example:end -->/, '<!-- example:start -->\n\n```kotlin\n'+imports+match[1].trim()+'\n```\n\n<!-- example:end -->');
  if (process.argv.includes('--check') && content !== expanded) throw new Error('Quickstart snippet drift: run npm run sync and commit docs/agents/quickstart.md');
  content = expanded;
  if (!process.argv.includes('--check')) await write(resolve(repo,source),content);
 }
 await write(resolve(site,`public/agents/${file}.md`),rewriteMarkdown(content,source));
 await write(resolve(site,`src/content/docs/${slug}.md`),`---\ntitle: ${title}\n---\n\n`+rewriteMarkdown(content.replace(/^# [^\n]+\n/,''),source,'human'));
}
for (const [source,slug,title] of [['IMPORT.md','installation','Installation'],['docs/documentation.md','development','Documentation maintenance'],['docs/releases.md','releases','Build and release'],['docs/site-home.md','index','Apexfission Coordinates']]) {
 const content = await readFile(resolve(repo,source),'utf8');
 await write(resolve(site,`src/content/docs/${slug}.md`),`---\ntitle: ${title}\n---\n\n`+rewriteMarkdown(content.replace(/^# [^\n]+\n/,''),source,'human'));
 if (source === 'IMPORT.md') await write(resolve(site,'public/IMPORT.md'),rewriteMarkdown(content,source));
}

if (!process.argv.includes('--check')) await import('./sync-versioned.mjs');

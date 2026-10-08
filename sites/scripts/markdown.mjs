import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import { posix } from 'node:path';

export const base = '/android.apexfission.math.coordinates';
export const repository = 'https://github.com/lambdawalker/android.apexfission.math.coordinates';
export const humanPages = {
  'index.md': 'agents', 'quickstart.md': 'getting-started', 'api.md': 'reference',
  'concepts.md': 'concepts', 'limitations.md': 'limitations', 'troubleshooting.md': 'troubleshooting',
  'migration.md': 'migration', 'recipes.md': 'task-recipes',
};
export const parser = () => unified().use(remarkParse).use(remarkGfm);
export function rewriteMarkdown(markdown, sourcePath, mode = 'raw') {
  const tree = parser().parse(markdown);
  visit(tree, node => {
    if (!['link','image','definition'].includes(node.type)) return;
    let href = node.url;
    if (href.startsWith(repository + '/blob/main/')) href = '/' + href.slice((repository + '/blob/main/').length);
    const ownSource = node.url.startsWith(repository + '/blob/main/');
    if (!ownSource && /^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) return;
    const url = new URL(href, `https://local/${sourcePath}`);
    const target = decodeURIComponent(url.pathname.slice(1));
    const suffix = url.search + url.hash;
    let output;
    if (target.startsWith('docs/agents/')) {
      const guide = target.slice('docs/agents/'.length);
      output = mode === 'human' && humanPages[guide]
        ? `${base}/${humanPages[guide]}/`
        : `${base}/agents/${guide}`;
    } else if (target === 'IMPORT.md') output = mode === 'human' ? `${base}/installation/` : `${base}/IMPORT.md`;
    else if (mode === 'human' && ['docs/documentation.md','docs/releases.md','docs/site-home.md'].includes(target)) output = `${base}/${{'docs/documentation.md':'development','docs/releases.md':'releases','docs/site-home.md':''}[target]}/`.replace(/\/\/$/, '/');
    else output = `${repository}/blob/main/${target}`;
    if (mode === 'raw' && output.startsWith(base + '/')) {
      const from = sourcePath.startsWith('docs/agents/') ? `agents/${sourcePath.slice('docs/agents/'.length)}` : sourcePath;
      output = posix.relative(posix.dirname(from), output.slice(base.length + 1));
    }
    node.url = output + suffix;
  });
  return unified().use(remarkStringify, {fences:true, bullet:'-'}).use(remarkGfm).stringify(tree);
}

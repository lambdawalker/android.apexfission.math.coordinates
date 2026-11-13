import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import test from 'node:test';
const repository = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(repository, 'sites/dist');
const module = 'coordinates';
const prefix = '/android.apexfission.math.coordinates';
const scopes = JSON.parse(readFileSync(resolve(output, 'versions.json'), 'utf8'));
const local = href => resolve(output, href.slice(prefix.length).replace(/^\//, ''));
const read = path => readFileSync(path, 'utf8');
test('all catalog human/raw routes exist for both languages and development/release', () => {
  assert.deepEqual([...new Set(scopes.map(s => s.language))].sort(), ['en', 'es']);
  for (const scope of scopes) {
    assert.equal(scope.module, module);
    for (const page of scope.pages) {
      assert.ok(existsSync(resolve(local(page.href), 'index.html')), page.href);
      const raw = read(local(page.raw));
      assert.ok(raw.includes(scope.source), page.raw);
      assert.ok(raw.includes(scope.documentation_ref), page.raw);
    }
  }
  for (const path of ['IMPORT.md', 'llms.txt', 'agents/index.md']) assert.ok(existsSync(resolve(output, path)), path);
});
test('archived executable examples use the documentation revision in human and raw links', () => {
  const example = 'src/test/java/com/apexfission/android/math/examples/DocumentationExamplesTest.kt';
  for (const scope of scopes.filter(s => !s.development)) {
    // This is an intentional history boundary: this example did not exist at release.
    execFileSync('git', ['cat-file', '-e', `${scope.documentation_ref}:${example}`], {cwd: repository});
    assert.notEqual(spawnSync('git', ['cat-file', '-e', `${scope.source}:${example}`], {cwd: repository, stdio: 'ignore'}).status, 0, 'fixture example must be added after release');
    const pages = scope.pages.filter(page => read(local(page.raw)).includes(example));
    assert.ok(pages.length > 0, scope.root);
    for (const page of pages) {
      const expected = `/blob/${scope.documentation_ref}/${example}`;
      assert.ok(read(local(page.raw)).includes(expected), `raw example provenance: ${page.raw}`);
      assert.ok(read(resolve(local(page.href), 'index.html')).includes(expected), `human example provenance: ${page.href}`);
    }
  }
});

test('archived raw guides retain the postrelease correction and example checkout instruction', () => {
  for (const scope of scopes.filter(s => !s.development && s.source !== s.documentation_ref)) {
    for (const page of scope.pages.filter(p => p.slug !== 'installation')) {
      const raw = read(local(page.raw));
      assert.match(raw, scope.language === 'es' ? /Corrección posterior a la publicación/ : /Postrelease documentation correction/, page.raw);
    }
  }
});

test('legacy guide aliases and trusted assets survive the shared build', () => {
  const aliases = {agents: '', reference: 'api', 'getting-started': 'quickstart', 'task-recipes': 'recipes', installation: 'installation', migration: 'migration'};
  for (const [alias, guide] of Object.entries(aliases)) {
    assert.ok(read(resolve(output, alias, 'index.html')).includes(`${prefix}/en/${module}/development/${guide ? guide + '/' : ''}`), alias);
  }
  assert.ok(existsSync(resolve(output, 'favicon.svg')));
});
test('human archived pages retain explicit correction and both source identities', () => {
  for (const scope of scopes.filter(s => !s.development && s.source !== s.documentation_ref)) {
    const html = read(resolve(local(scope.root), 'index.html'));
    assert.ok(html.includes(scope.source.slice(0, 12)), scope.root);
    assert.ok(html.includes(scope.documentation_ref), scope.root);
    assert.match(html, scope.language === 'es' ? /Corrección posterior a la publicación/ : /Postrelease documentation correction/, scope.root);
  }
});

test('root agent discovery remains current Development rather than an archived release', () => {
  const scope = scopes.find(s => s.development && s.language === 'en');
  const raw = read(resolve(output, 'agents/index.md'));
  assert.ok(raw.includes('Version: development'), 'root agent guide must retain Development identity');
  assert.ok(raw.includes(scope.source), 'root agent guide must use current checkout source');
});

test('language selectors keep each concrete guide in the corresponding scope', () => {
  for (const scope of scopes) {
    const other = scopes.find(s => s.module === scope.module && s.version === scope.version && s.language !== scope.language);
    assert.ok(other, scope.root);
    for (const page of scope.pages) {
      const target = other.pages.find(p => p.slug === page.slug);
      assert.ok(target, page.href);
      assert.ok(read(resolve(local(page.href), 'index.html')).includes(target.href), `${page.href} -> ${target.href}`);
    }
  }
});
test('archived installation retains each confirmed destination coordinate', () => {
  for (const scope of scopes.filter(s => !s.development)) {
    const history = JSON.parse(read(resolve(repository, `docs/releases/history/${module}/${scope.version}.json`)));
    const installation = read(local(scope.pages.find(p => p.slug === 'installation').raw));
    for (const destination of Object.values(history.destinations)) {
      const coordinate = `${destination.group}:${destination.artifact}:${destination.consumer_version || destination.version}`;
      assert.ok(installation.includes(coordinate), `${scope.root}: ${coordinate}`);
    }
  }
});

test('the authored crop diagram and project overview remain available', () => {
  assert.equal(read(resolve(output, 'crop.svg')), read(resolve(repository, 'sites/astro/public/crop.svg')));
  const scope = scopes.find(s => s.development && s.language === 'en');
  const overview = scope.pages.find(p => p.slug === 'overview');
  assert.ok(overview, 'configured canonical project overview');
  assert.ok(read(resolve(local(overview.href), 'index.html')).includes('crop.svg'));
});

test('Spanish HTML retains English deep-link heading anchors', () => {
  const headingIds = html => [...html.matchAll(/<(?:h[123]|span)[^>]*id="([^"]+)"/g)].map(match => match[1]);
  for (const scope of scopes.filter(s => s.language === 'en')) {
    const translated = scopes.find(s => s.module === scope.module && s.version === scope.version && s.language === 'es');
    for (const page of scope.pages) {
      const other = translated.pages.find(p => p.slug === page.slug);
      const ids = headingIds(read(resolve(local(other.href), 'index.html')));
      const html = read(resolve(local(page.href), 'index.html'));
      // The first title anchor comes from the canonical source H1. Later title
      // aliases may be localized presentation labels (Installation/Instalación).
      const canonicalTitle = /<span[^>]*id="([^"]+)"/.exec(html)?.[1];
      const canonical = [...html.matchAll(/<h[23][^>]*id="([^"]+)"/g)].map(match => match[1]);
      if (canonicalTitle) canonical.push(canonicalTitle);
      for (const id of canonical) assert.ok(ids.includes(id), `${other.href}#${id}`);
    }
  }
});

test('every pinned repository source link resolves in its declared Git snapshot', () => {
  const links = new Set();
  const marker = `https://github.com/lambdawalker/android.apexfission.math.coordinates/blob/`;
  for (const scope of scopes) for (const page of scope.pages) {
    for (const content of [read(local(page.raw)), read(resolve(local(page.href), 'index.html'))]) {
      for (const match of content.matchAll(/https:\/\/github\.com\/[^\s"'<>\)\]]+/g)) {
        if (match[0].startsWith(marker)) links.add(match[0]);
      }
    }
  }
  assert.ok(links.size > 0, 'real source links must be audited');
  for (const link of links) {
    const target = decodeURIComponent(new URL(link).pathname).split('/blob/')[1];
    const match = /^([a-f0-9]{40})\/(.+)$/.exec(target);
    assert.ok(match, `repository source links must be immutable: ${link}`);
    execFileSync('git', ['cat-file', '-e', `${match[1]}:${match[2]}`], {cwd: repository});
  }
});

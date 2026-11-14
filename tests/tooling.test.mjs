import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32 } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pin = readFileSync(join(root, '.project/setup/config.yaml'), 'utf8').match(/^tooling_ref:\s*['"]?([a-z0-9.]+)/m)[1];
const executable = join(root, '.project/setup/cache', pin, 'bin', process.platform === 'win32' ? 'android-repo-setup.exe' : 'android-repo-setup');

function run(program, args, cwd = root, env = {}) {
  return spawnSync(program, args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
}
function cli(args, cwd = root, destination = 'maven-central') {
  return run(executable, ['--project', cwd, ...args], cwd, { RELEASE_REPOSITORY: destination });
}
function ok(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}
function zip(entries) {
  const parts = [], directory = [];
  let offset = 0;
  for (const [path, contents] of Object.entries(entries)) {
    const name = Buffer.from(path), bytes = Buffer.from(contents);
    const header = Buffer.alloc(30), central = Buffer.alloc(46);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4);
    header.writeUInt32LE(crc32(bytes), 14); header.writeUInt32LE(bytes.length, 18);
    header.writeUInt32LE(bytes.length, 22); header.writeUInt16LE(name.length, 26);
    central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc32(bytes), 16); central.writeUInt32LE(bytes.length, 20);
    central.writeUInt32LE(bytes.length, 24); central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
    parts.push(header, name, bytes); directory.push(central, name);
    offset += header.length + name.length + bytes.length;
  }
  const central = Buffer.concat(directory), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(Object.keys(entries).length, 8);
  end.writeUInt16LE(Object.keys(entries).length, 10); end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, central, end]);
}

test('pinned setup owns bootstrap, registry and root module selection', () => {
  assert.ok(existsSync(executable), 'Run setup.sh --version (Windows: setup.bat --version) first');
  ok(cli(['bootstrap', 'check']));
  ok(cli(['workflows', '--check']));
  ok(cli(['publishing_config', 'check']));
  assert.equal(ok(cli(['module-path', 'coordinates'])).trim(), '');
  assert.ok(!existsSync(join(root, 'scripts')), 'repository-local release implementation must stay retired');
});

for (const destination of ['maven-central', 'jitpack']) {
  test(`${destination}: real CLI verifies the JVM publication contract without upload`, () => {
    const fixture = mkdtempSync(join(tmpdir(), 'coordinates-cli-'));
    try {
      const write = (path, data) => { const p = join(fixture, path); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, data); };
      write('.project/setup/config.yaml', readFileSync(join(root, '.project/setup/config.yaml')));
      write('.project/setup/repositories.yml', readFileSync(join(root, '.project/setup/repositories.yml')));
      write('.project/setup/modules.properties', readFileSync(join(root, '.project/setup/modules.properties')));
      write('gradle.properties', 'GROUP=com.apexfission.android.math\nPOM_ARTIFACT_ID=coordinates\n');
      write('src/main/Point.kt', 'class Point');
      ok(run('git', ['init', '-q'], fixture));
      ok(run('git', ['add', '.'], fixture));
      ok(run('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'JVM fixture'], fixture));
      const source = ok(run('git', ['rev-parse', 'HEAD'], fixture)).trim();
      const jitpack = destination === 'jitpack';
      const group = jitpack ? 'com.github.lambdawalker' : 'com.apexfission.android.math';
      const artifact = jitpack ? 'android.apexfission.math.coordinates' : 'coordinates';
      const version = jitpack ? 'coordinates~v9.8.7-jitpack' : '9.8.7';
      const base = `build/verification-repository/${group.replaceAll('.', '/')}/${artifact}/${version}/${artifact}-${version}`;
      const pom = `<project><groupId>${group}</groupId><artifactId>${artifact}</artifactId><version>${version}</version><packaging>jar</packaging><name>Coordinates</name><description>Geometry</description><url>https://example.invalid</url><licenses><license><name>Apache</name><url>https://example.invalid/license</url></license></licenses><developers><developer><id>test</id><name>Test</name></developer></developers><scm><url>https://example.invalid</url><connection>scm:git:example</connection></scm><dependencies><dependency><groupId>org.jetbrains.kotlin</groupId><artifactId>kotlin-stdlib</artifactId></dependency></dependencies></project>`;
      const metadata = { component: { group, module: artifact, version }, variants: ['java-api', 'java-runtime'].map(usage => ({ attributes: { 'org.gradle.category': 'library', 'org.gradle.usage': usage, 'org.gradle.jvm.version': 11, 'org.jetbrains.kotlin.platform.type': 'jvm' }, dependencies: [{ group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib' }] })) };
      write(base + '.pom', pom); write(base + '.module', JSON.stringify(metadata));
      const classes = target => zip({ 'com/apexfission/android/math/Point.class': Buffer.from([0xca, 0xfe, 0xba, 0xbe, 0, 0, 0, target]) });
      write(base + '.jar', classes(55)); write(base + '-sources.jar', zip({ 'Point.kt': 'class Point' })); write(base + '-javadoc.jar', zip({ 'docs/guide.md': '# Guide' }));
      const args = ['module_release', 'check-local', '--module', 'coordinates', '--version', '9.8.7', '--source', source];
      const record = JSON.parse(ok(cli(args, fixture, destination)));
      assert.equal(record.verification.packaging, 'jar'); assert.equal(record.verification.bytecode_major, 55);
      assert.ok(record.sha256['.jar']); assert.ok(!record.sha256['.aar']); assert.ok(record.content_sha256['-sources.jar']['Point.kt']);
      write(base + '.jar', classes(61)); assert.notEqual(cli(args, fixture, destination).status, 0, 'Java 17 bytecode must be rejected');
      write(base + '.jar', classes(55)); write(base + '.pom', pom.replace('org.jetbrains.kotlin', 'androidx.compose.runtime'));
      assert.notEqual(cli(args, fixture, destination).status, 0, 'compile-only Compose must not leak into public dependencies');
      write(base + '.pom', pom); metadata.variants[0].attributes['org.gradle.jvm.version'] = 17; write(base + '.module', JSON.stringify(metadata));
      assert.notEqual(cli(args, fixture, destination).status, 0, 'wrong Gradle JVM target must be rejected');
    } finally { rmSync(fixture, { recursive: true, force: true }); }
  });
}

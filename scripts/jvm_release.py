"""JVM artifact verification and transport used by module_release; no release commands."""
import hashlib
import io
import json
import os
import re
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

CENTRAL = 'https://repo.maven.apache.org/maven2'
SEMVER = r'(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)'
SUFFIXES = ('.pom', '.jar', '-sources.jar', '-javadoc.jar', '.module')


def version_key(value):
    if not re.fullmatch(SEMVER, value):
        raise ValueError(f'Expected stable X.Y.Z, got {value!r}')
    return tuple(map(int, value.split('.')))


def next_version(tags, published, initial=''):
    tagged = {t[1:] for t in tags if re.fullmatch('v' + SEMVER, t)}
    stable = {v for v in published if re.fullmatch(SEMVER, v)}
    if tagged - stable:
        raise ValueError(f'Tags not published on Central: {sorted(tagged - stable)}')
    if initial:
        version_key(initial)
        if stable or tagged:
            raise ValueError('initial_version is only permitted with no stable release history')
        return initial
    if not stable:
        raise ValueError('First release requires explicit initial_version (for example 0.1.0)')
    latest = max(stable, key=version_key)
    if tagged and max(tagged, key=version_key) != latest:
        raise ValueError('Central is ahead of tags; reconcile source provenance')
    major, minor, patch = version_key(latest)
    return f'{major}.{minor}.{patch + 1}'


def fetch(url, missing=False, attempts=3):
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(url, timeout=20) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code == 404 and missing:
                return None
            if error.code != 429 and error.code < 500:
                raise
            if attempt == attempts - 1:
                raise
        except (urllib.error.URLError, TimeoutError):
            if attempt == attempts - 1:
                raise
        time.sleep(2 ** attempt)


def artifact_base(group, artifact):
    return f'{CENTRAL}/{group.replace(".", "/")}/{artifact}'


def published_versions(group, artifact):
    data = fetch(artifact_base(group, artifact) + '/maven-metadata.xml', missing=True)
    if data is None:
        return []
    xml = ET.fromstring(data)
    if xml.tag != 'metadata' or xml.findtext('groupId') != group or xml.findtext('artifactId') != artifact:
        raise ValueError('Invalid Central metadata identity')
    versions = xml.findall('./versioning/versions/version')
    if not versions or any(not node.text for node in versions):
        raise ValueError('Malformed/empty Central metadata')
    return [node.text for node in versions]


def verify_pom(data, group, artifact, version):
    xml = ET.fromstring(data)
    for node in xml.iter():
        node.tag = node.tag.split('}')[-1]
    if tuple(xml.findtext(k) for k in ('groupId', 'artifactId', 'version')) != (group, artifact, version):
        raise ValueError('POM coordinates/version mismatch')
    if xml.findtext('packaging', 'jar') != 'jar':
        raise ValueError('Publication must be a JVM JAR')
    for path in ('name', 'description', 'url', 'licenses/license/name', 'licenses/license/url',
                 'developers/developer/id', 'developers/developer/name', 'scm/url', 'scm/connection'):
        if not xml.findtext(path):
            raise ValueError(f'Missing POM metadata: {path}')
    dependencies = xml.findall('dependencies/dependency')
    if any(n.findtext('groupId', '').startswith('androidx.compose') for n in dependencies):
        raise ValueError('Compile-only Compose annotations leaked into the POM')
    if not any(n.findtext('groupId') == 'org.jetbrains.kotlin' and
               n.findtext('artifactId') == 'kotlin-stdlib' and
               n.findtext('scope', 'compile') in ('compile', 'runtime') for n in dependencies):
        raise ValueError('Kotlin standard library dependency is missing')


def verify_artifact(data, suffix, group, artifact, version):
    if suffix == '.pom':
        verify_pom(data, group, artifact, version)
    elif suffix == '.module':
        module = json.loads(data)
        if tuple(module.get('component', {}).get(k) for k in ('group', 'module', 'version')) != (group, artifact, version):
            raise ValueError('Gradle module coordinates mismatch')
        # Sources/documentation variants also use java-runtime, but have no
        # executable JVM target or dependencies. Check only library variants.
        variants = [v for v in module.get('variants', [])
                    if v.get('attributes', {}).get('org.gradle.category') == 'library'
                    and v['attributes'].get('org.gradle.usage') in ('java-api', 'java-runtime')]
        if {v['attributes']['org.gradle.usage'] for v in variants} != {'java-api', 'java-runtime'}:
            raise ValueError('Missing JVM API/runtime variants')
        for variant in variants:
            attrs = variant['attributes']
            if attrs.get('org.gradle.jvm.version') != 11 or attrs.get('org.jetbrains.kotlin.platform.type') != 'jvm':
                raise ValueError(f'Unexpected Gradle JVM target/platform: {attrs!r}')
            deps = variant.get('dependencies', [])
            if any(d.get('group', '').startswith('androidx.compose') for d in deps):
                raise ValueError('Compile-only Compose dependency leaked into Gradle metadata')
            if not any(d.get('group') == 'org.jetbrains.kotlin' and d.get('module') == 'kotlin-stdlib' for d in deps):
                raise ValueError('Kotlin standard library missing from Gradle variant')

    else:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            if archive.testzip():
                raise ValueError('Corrupt JAR')
            names = archive.namelist()
            if suffix == '.jar':
                classes = [n for n in names if n.endswith('.class') and n.startswith('com/apexfission/android/math/')]
                if not classes or any(archive.read(n)[:4] != b'\xca\xfe\xba\xbe' or
                                      int.from_bytes(archive.read(n)[6:8], 'big') != 55 for n in classes):
                    raise ValueError('Missing geometry classes or unexpected JVM bytecode target')
            elif suffix == '-sources.jar' and not any(n.endswith('.kt') for n in names):
                raise ValueError('Sources JAR has no Kotlin source')
            elif suffix == '-javadoc.jar' and not any(n.endswith(('.md', '.html')) for n in names):
                raise ValueError('Documentation JAR has no documentation')


def outputs(values):
    text = ''.join(f'{k}={v}\n' for k, v in values.items())
    print(text, end='')
    if os.environ.get('GITHUB_OUTPUT'):
        with open(os.environ['GITHUB_OUTPUT'], 'a') as stream:
            stream.write(text)
    return values


def zip_contents(data):
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        if len(archive.namelist()) != len(set(archive.namelist())):
            raise ValueError('Duplicate archive entries')
        return {name: hashlib.sha256(archive.read(name)).hexdigest() for name in archive.namelist()
                if not name.endswith('/') and name != 'META-INF/MANIFEST.MF'}

import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error
import zipfile

SPEC = importlib.util.spec_from_file_location('release', Path(__file__).parents[1] / 'jvm_release.py')
release = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(release)


def pom(version='1.2.3'):
    return f'''<project xmlns="http://maven.apache.org/POM/4.0.0"><groupId>org.example</groupId>
<artifactId>coordinates</artifactId><version>{version}</version><name>Coordinates</name>
<description>Geometry</description><url>https://example.org</url>
<licenses><license><name>Apache-2.0</name><url>https://example.org/license</url></license></licenses>
<developers><developer><id>owner</id><name>Owner</name></developer></developers>
<scm><url>https://example.org</url><connection>scm:git:https://example.org</connection></scm>
<dependencies><dependency><groupId>org.jetbrains.kotlin</groupId><artifactId>kotlin-stdlib</artifactId>
<version>2.4.20</version><scope>compile</scope></dependency></dependencies></project>'''.encode()


def jar(name, data):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w') as archive:
        archive.writestr(name, data)
    return stream.getvalue()


def artifacts():
    return {'.pom': pom(), '.jar': jar('com/apexfission/android/math/Point.class', b'\xca\xfe\xba\xbe\x00\x00\x00\x37'),
            '-sources.jar': jar('Point.kt', 'class Point'), '-javadoc.jar': jar('guide.md', 'Geometry'),
            '.module': json.dumps({'component': {'group': 'org.example', 'module': 'coordinates', 'version': '1.2.3'}, 'variants': [{'attributes': {'org.gradle.category': 'library', 'org.gradle.usage': usage, 'org.gradle.jvm.version': 11, 'org.jetbrains.kotlin.platform.type': 'jvm'}, 'dependencies': [{'group': 'org.jetbrains.kotlin', 'module': 'kotlin-stdlib'}]} for usage in ('java-api', 'java-runtime')]}).encode()}


def record():
    return dict(version='1.2.3', source='a' * 40, group='org.example', artifact='coordinates',
                sha256={s: hashlib.sha256(d).hexdigest() for s, d in artifacts().items()}, phase='reserved-before-upload')


class PolicyTests(unittest.TestCase):
    def test_semantic_order(self):
        self.assertEqual(release.next_version(['v0.1.9', 'v0.1.10', 'other', 'v2.0.0-rc1'], ['0.1.9', '0.1.10']), '0.1.11')

    def test_initial_requires_explicit_value(self):
        with self.assertRaisesRegex(ValueError, 'initial_version'):
            release.next_version([], [])
        self.assertEqual(release.next_version([], [], '0.1.0'), '0.1.0')

    def test_bootstrap_existing_metadata_without_fabricated_tags(self):
        self.assertEqual(release.next_version([], ['0.1.9', '0.1.10', '3.0.0-rc1']), '0.1.11')

    def test_every_stable_tag_must_exist(self):
        with self.assertRaisesRegex(ValueError, 'not published'):
            release.next_version(['v0.1.0', 'v0.1.1'], ['0.1.1'])

    def test_central_ahead_stops(self):
        with self.assertRaisesRegex(ValueError, 'ahead'):
            release.next_version(['v0.1.0'], ['0.1.0', '0.1.1'])

    def test_initial_cannot_override_existing_history(self):
        with self.assertRaises(ValueError):
            release.next_version([], ['0.1.0'], '2.0.0')

    def test_stable_versions_only(self):
        for value in ['01.2.3', '1.2', 'v1.2.3', '1.2.3-SNAPSHOT', '1.2.3-rc1', '$(id)', '1.2.3\n']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                release.version_key(value)

    def test_404_metadata_is_empty(self):
        with patch.object(release, 'fetch', return_value=None):
            self.assertEqual(release.published_versions('org.example', 'coordinates'), [])

    def test_metadata_network_failure_is_not_empty(self):
        with patch.object(release, 'fetch', side_effect=urllib.error.URLError('offline')):
            with self.assertRaises(urllib.error.URLError):
                release.published_versions('org.example', 'coordinates')

    def test_metadata_identity_validation(self):
        with patch.object(release, 'fetch', return_value=b'<metadata><groupId>wrong</groupId></metadata>'):
            with self.assertRaises(ValueError):
                release.published_versions('org.example', 'coordinates')

    def test_empty_malformed_metadata_is_not_empty_history(self):
        with patch.object(release, 'fetch', return_value=b'<metadata><groupId>org.example</groupId><artifactId>coordinates</artifactId></metadata>'):
            with self.assertRaises(ValueError):
                release.published_versions('org.example', 'coordinates')

    def test_transient_retry_is_bounded(self):
        with patch.object(release.urllib.request, 'urlopen', side_effect=urllib.error.URLError('offline')) as request, patch.object(release.time, 'sleep'):
            with self.assertRaises(urllib.error.URLError):
                release.fetch('https://example.invalid')
            self.assertEqual(request.call_count, 3)

    def test_permanent_http_error_is_not_retried(self):
        error = urllib.error.HTTPError('url', 403, 'Forbidden', {}, None)
        with patch.object(release.urllib.request, 'urlopen', side_effect=error) as request:
            with self.assertRaises(urllib.error.HTTPError):
                release.fetch('https://example.invalid', missing=True)
            self.assertEqual(request.call_count, 1)


class ArtifactTests(unittest.TestCase):
    def test_validate_all_unsigned_artifacts(self):
        for suffix, data in artifacts().items():
            release.verify_artifact(data, suffix, 'org.example', 'coordinates', '1.2.3')

    def test_wrong_pom_version(self):
        with self.assertRaises(ValueError):
            release.verify_pom(pom('1.2.4'), 'org.example', 'coordinates', '1.2.3')

    def test_wrong_packaging(self):
        with self.assertRaises(ValueError):
            release.verify_pom(pom().replace(b'<name>', b'<packaging>aar</packaging><name>', 1), 'org.example', 'coordinates', '1.2.3')

    def test_compose_cannot_leak_to_runtime(self):
        with self.assertRaises(ValueError):
            release.verify_pom(pom().replace(b'org.jetbrains.kotlin', b'androidx.compose.runtime'), 'org.example', 'coordinates', '1.2.3')

    def test_missing_kotlin_dependency(self):
        with self.assertRaises(ValueError):
            release.verify_pom(pom().replace(b'kotlin-stdlib', b'other'), 'org.example', 'coordinates', '1.2.3')

    def test_wrong_bytecode_target(self):
        with self.assertRaises(ValueError):
            release.verify_artifact(jar('com/apexfission/android/math/Point.class', b'\xca\xfe\xba\xbe\0\0\0\x3d'), '.jar', 'org.example', 'coordinates', '1.2.3')

    def test_empty_companion_jars(self):
        for suffix in ('-sources.jar', '-javadoc.jar'):
            with self.subTest(suffix=suffix), self.assertRaises(ValueError):
                release.verify_artifact(jar('META-INF/MANIFEST.MF', ''), suffix, 'org.example', 'coordinates', '1.2.3')

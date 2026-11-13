"""Install the real pinned documentation launcher into isolated release fixtures."""
import os
from pathlib import Path
import shutil

REPOSITORY = Path(__file__).resolve().parents[2]
PIN = '1da53392b262c7c3129d2bd645dfd7b34ead81e1'


def install(root):
    metadata = root / '.project/docs'
    metadata.mkdir(parents=True, exist_ok=True)
    (metadata / 'config.yaml').write_text(
        'schema: 1\nrepository: lambdawalker/android.apexfission.math.coordinates\n'
        'title: Coordinates\nmodules:\n  coordinates: coordinates\n'
        f'tooling_ref: {PIN}\n')
    for name in ('docs.sh', 'docs.bat'):
        source = REPOSITORY / name
        if source.exists():
            shutil.copy2(source, root / name)
    binary = 'android-repo-docs.exe' if os.name == 'nt' else 'android-repo-docs'
    source = REPOSITORY / f'.project/docs/cache/{PIN}/bin' / binary
    if not source.is_file():
        raise RuntimeError('Run docs.sh --version (Windows: docs.bat --version) before release tests')
    target = metadata / f'cache/{PIN}/bin' / binary
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def write_record(root, record):
    target = record.get('repository', 'maven-central')
    path = root / 'docs/releases' / ('' if target == 'maven-central' else target) / 'coordinates.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    import json
    path.write_text(json.dumps(record))


def archive_record(root, record):
    import module_release as release
    if not (root / 'docs.sh').exists():
        install(root)
    write_record(root, record)
    release.run_docs(root, 'history', 'seed')
    suffix = '-' + record['repository'] if 'source_tag' in record else ''
    return Path('docs/releases/history/coordinates') / (record['version'] + suffix + '.json')


def render(records):
    import tempfile
    import module_release as release
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        install(root)
        (root / 'gradle.properties').write_text('GROUP=com.apexfission.android.math\nPOM_ARTIFACT_ID=coordinates\n')
        (root / 'docs/templates').mkdir(parents=True)
        (root / 'docs/templates/IMPORT.md.template').write_text('{{INSTALLATION}}\n')
        for record in records:
            write_record(root, record)
        release.run_docs(root, 'imports')
        return (root / 'IMPORT.md').read_text()

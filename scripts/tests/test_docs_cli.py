import json
from pathlib import Path
import tempfile
import unittest
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import module_release as release
from docs_fixture import install


class SharedDocumentationTests(unittest.TestCase):
    def test_failed_import_check_leaves_existing_guide_untouched(self):
        import subprocess
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            install(root)
            (root / 'gradle.properties').write_text('GROUP=org.example\nPOM_ARTIFACT_ID=coordinates\n')
            (root / 'docs/templates').mkdir(parents=True)
            (root / 'docs/templates/IMPORT.md.template').write_text('{{INSTALLATION}}\n')
            (root / 'IMPORT.md').write_text('hand edited guide')
            with self.assertRaises(subprocess.CalledProcessError):
                release.run_docs(root, 'imports', '--check')
            self.assertEqual((root / 'IMPORT.md').read_text(), 'hand edited guide')

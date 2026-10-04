"""Install the local integration overlay without editing native SDK bundles."""
from pathlib import Path
import json
root = Path('/var/www/euro-office/documentserver/web-apps/apps/documenteditor')
script = '<script src="../connection-status-20261003.js"></script>'
for kind in ['main', 'mobile']:
    page = root / kind / 'index.html'
    text = page.read_text()
    if script not in text:
        if '</head>' not in text:
            raise RuntimeError(f'Unexpected native page: {kind}')
        page.write_text(text.replace('</head>', script + '\n</head>', 1))
config_path = Path('/etc/euro-office/documentserver/default.json')
config = json.loads(config_path.read_text())
# The application callback/lease fence fix is required alongside this grace.
config['services']['CoAuthoring']['server']['savetimeoutdelay'] = 90000
config_path.write_text(json.dumps(config, indent=2) + '\n')

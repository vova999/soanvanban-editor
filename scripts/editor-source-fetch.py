#!/usr/bin/env python3
"""Download/verify pinned source evidence locally. Never publishes or deploys."""
import argparse
import hashlib
import json
import pathlib
import shutil
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument("output", help="Separate source-evidence directory outside the app")
parser.add_argument("--verify-only", action="store_true")
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parent.parent
output = pathlib.Path(args.output).resolve()
if output == root or root in output.parents:
    raise SystemExit("Use a directory outside the application")
manifest = json.loads((root / "docs/EDITOR-UPSTREAM-SOURCES.json").read_text())
output.mkdir(parents=True, exist_ok=True)

def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

for item in manifest["archives"]:
    if pathlib.Path(item["file"]).name != item["file"] or not item["url"].startswith("https://github.com/vova999/soanvanban-editor/releases/download/editor-source-2026-10-03.1/") or len(item["commit"]) != 40:
        raise SystemExit("Invalid pinned source input")
    target = output / item["file"]
    if target.is_symlink():
        raise SystemExit("Symlink output refused")
    if target.exists():
        if target.stat().st_size != item["bytes"] or digest(target) != item["sha256"]:
            raise SystemExit("Existing file differs: " + item["file"])
    else:
        if args.verify_only:
            raise SystemExit("Missing archive: " + item["file"])
        if shutil.disk_usage(output).free < item["bytes"] + 3 * 1024**3:
            raise SystemExit("Keep at least 3 GiB disk reserve")
        partial = output / (item["file"] + ".download")
        # Exclusive creation preserves existing work after an interrupted download.
        with urllib.request.urlopen(item["url"], timeout=90) as response, partial.open("xb") as stream:
            size = 0
            for block in iter(lambda: response.read(1024 * 1024), b""):
                size += len(block)
                if size > item["bytes"]:
                    raise SystemExit("Source size differs from reviewed archive")
                stream.write(block)
        if partial.stat().st_size != item["bytes"] or digest(partial) != item["sha256"]:
            raise SystemExit("Source hash differs: " + item["file"])
        partial.rename(target)
    print("Verified", item["file"])
print("Local source evidence verified; no upload/deployment. These archives omit font binaries and other nontext assets. Full builds require separate licensed acquisition of omitted upstream inputs.")

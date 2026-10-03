# Copied UniKey character mappings

`tables.json` is moved byte for byte from `server/legacy-vietnamese-tables.json`. Its provenance and GPL-2.0-or-later notice are in `NOTICE.md` and `LICENSE`. The private backend still imports these tables in process; moving their directory does not remove that dependency or settle combined-work licensing. Application conversion logic remains in `server/legacy-vietnamese.js` and passes the existing conversion tests. This directory is included explicitly in the proposed public preparation package.

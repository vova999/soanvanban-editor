# Soạn Văn Bản editor/plugin source

This repository publishes the reviewed editor/plugin source independently of the private application history. It contains the standalone plugin service and messaging bridge, original distributed SDK with its exact editable upstream source and notices, editor theme/patches/build tools, mobile dependency lock, UniKey mapping source, and provenance/font metadata. Application server/web code, credentials, documents, databases, font files and compiled binaries are excluded.

The versioned source archives are in [the source release](https://github.com/vova999/soanvanban-editor/releases/tag/editor-source-2026-10-03.1). `RELEASE-SOURCES.json`, `SHA256SUMS` and the per-archive exclusion reports identify exact published bytes and original immutable upstream pins. These are **filtered text-source snapshots**, not unmodified upstream archives or a claim of legally cleared, complete Corresponding Source. Nontext assets, fonts, executables/libraries, nested binary containers and credential-pattern fixtures are omitted. Original copyright/license notices are retained. The pinned upstream URLs identify the omitted assets; obtain them only under their applicable rights before attempting a full build.

## Plugin service

Node 24.9.0 is the qualified runtime. From `components/editor-plugin`, run `npm test`, then:

```sh
APP_ORIGIN=http://localhost:3100 EDITOR_PUBLIC_ORIGIN=http://localhost:8080 npm start
```

The service binds to loopback port 3102 by default and needs no runtime npm dependencies. Configure only public origins plus HOST/PORT; never provide application credentials or data. The application-side HTTP integration is described in [the interface contract](docs/EDITOR-INTERFACE.md); private application implementation is excluded.

The exact editable client SDK and a pinned source-build recipe are under `components/editor-plugin/preferred-sdk`. Run `npm ci --ignore-scripts`, then `npm run build` there. It writes a separate candidate, preserves notices and never replaces `assets/sdk.js`. The rebuild succeeds but does not reproduce the vendor's minified bytes; it is not a qualified runtime replacement.

## Editor source/build coverage

See [native build instructions](deploy/euro-office/README.md), [upstream inventory](docs/EDITOR-UPSTREAM-SOURCES.json) and [publication scope](docs/PUBLICATION-REVIEW.md). The 14 pinned component/release/submodule snapshots and the additional customized live-7 web-apps snapshot are separate release assets. Their original binary/font/nontext contents were not rehosted. The filters mean the release archives alone cannot reproduce a complete upstream image; build/install scripts and dependency locks are supplied, but omitted inputs must be obtained separately from their exact upstream versions with the appropriate rights.

The live editor's `svb.7` theme/background-plugin modification is distinct from the prepared future branding `svb.8` overlay. Version 8 has not been image-qualified. No application, editor, container image or service endpoint was deployed or changed by this source publication.

## Licenses and limits

Project editor/plugin code retains its existing AGPL terms; copied components retain their own licenses/additional notices. UniKey mappings remain GPL-2.0-or-later. Component archives preserve their original AGPL, Apache and third-party notices. The optional pinned SDK minifier is Apache-2.0. See [NOTICE](NOTICE), component licenses, and archive notices. Nothing here relicenses upstream code or certifies that a separate private application is outside a covered combined work.

The font metadata covers 240 live TTF/OTF files; collection fonts are excluded from publication too. No font binaries are included. Microsoft core-font acquisition/EULA and a few missing vendor font notices require separate review before any font-bearing redistribution. Existing application licenses/source offers remain unchanged.

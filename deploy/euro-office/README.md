# Soạn Văn Bản editor customization

This directory keeps the small, reviewable customization inputs for the Mac's qualified editor. It contains no upstream checkout, built bundles, document data, credentials, font binaries or source archive. Committing it privately does not publish an editor release or change the live service.

The pinned base is `ghcr.io/euro-office/documentserver:v9.3.4-hotfix.1@sha256:a9e94372e01084b478365b291857f7ded2945d572776f0886dc0d61bd156fad1` (qualified ARM64 release). Its web-apps component is `b8eb618b91d682bb7bc3d55b1830c897ebc7e8d6`. Obtain that exact preferred source from [Euro-Office web-apps](https://github.com/Euro-Office/web-apps/tree/b8eb618b91d682bb7bc3d55b1830c897ebc7e8d6), keeping the original notices. Other component pins are in the [release tree](https://github.com/Euro-Office/DocumentServer/tree/v9.3.4-hotfix.1).

## Local build preparation

Use a separate, ignored `source/` checkout of the pinned web-apps revision. Copy `theme/soanvanban/` into its `theme/` directory. Apply `background-plugin.patch` once from that checkout using `git apply`; the verifier rejects an unfixed desktop controller. Install the pinned dependencies with `npm ci` in `source/build`. Before running `npm ci` in `source/vendor/framework7-react`, copy the reviewed `mobile-package-lock.json` there as `package-lock.json`. Upstream omitted that lock; it was reconstructed from the qualified Mac build's installed graph, preserving all 1,097 installed package versions and adding missing foreign-platform optional package metadata. A dry-run clean install validates the repaired lock.

From this directory, run `node build-theme.mjs`. `EURO_SOURCE_ROOT` and `EURO_BUILD_ROOT` may point to separate local directories. The wrapper merges translation fallbacks, runs upstream build targets sequentially, verifies locale completeness, then applies the five static copy overlays from `prepare-copy.mjs`. It neither builds a Docker image nor creates, uploads or publishes source archives.

`prepare-copy.mjs INPUT OUTPUT` can also be run separately on a qualified web-apps tree. It writes only two locale titles and three English help pages to a separate output directory, with a file manifest. The error titles retain the limit's meaning. Adapted help retains original technical-content attribution, adds a dated CC BY-SA notice and describes browser use. Neither SDK code nor license/feature gates are changed.

The theme promotes Soạn Văn Bản in title, header, loader and service publisher/support fields. Attribution still identifies Euro-Office and ONLYOFFICE by Ascensio System SIA. Original About artwork and legal notices are retained; this does not assert that every upstream About sentence is immutable. The official [branded-build guide](https://euro-office.github.io/documentation/development/building/#build-a-branded-image) supports changing product branding.

`Dockerfile` describes the custom frontend layer on the pinned image. Reproducing the earlier font-preservation layer also needs a locally supplied `preserved-fonts.tar`; it is ignored and must not be committed. Preserve filename case and review the font rights independently. Building or switching a live image needs separate release qualification and authorization.

## Publication boundary

Keep `LICENSE`, `ATTRIBUTION`, original source notices and browser legal/source links. A private repository does not satisfy a public user's source offer by itself. The live theme and background-plugin fix are editor modifications; any future editor release must have an appropriate corresponding-source offer for its actual version. The current public editor archive lacks the live background-plugin fix. No archive is included or published by this commit.

The application's existing AGPL declaration remains unchanged. Ownership and copied components must be considered separately before asserting that future independently owned wrapper code must be published. Existing recipients retain their licenses. See [the branding checkpoint](../../docs/BRANDING-CLEANUP.md).

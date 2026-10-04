# Soạn Văn Bản editor customization

This directory contains the reviewed preferred customization inputs for the Mac editor, including its qualified branding and resume overlay. It contains no upstream checkout, built bundles, document data, credentials or font binaries.

The pinned base is `ghcr.io/euro-office/documentserver:v9.3.4-hotfix.1@sha256:a9e94372e01084b478365b291857f7ded2945d572776f0886dc0d61bd156fad1` (qualified ARM64 release). Its web-apps component is `b8eb618b91d682bb7bc3d55b1830c897ebc7e8d6`. Obtain that exact preferred source from [Euro-Office web-apps](https://github.com/Euro-Office/web-apps/tree/b8eb618b91d682bb7bc3d55b1830c897ebc7e8d6), keeping the original notices. Other component pins are in the [release tree](https://github.com/Euro-Office/DocumentServer/tree/v9.3.4-hotfix.1).

## Local build preparation

Use a separate, ignored `source/` checkout of the pinned web-apps revision. Copy `theme/soanvanban/` into its `theme/` directory. Apply `background-plugin.patch` once from that checkout using `git apply`; the verifier rejects an unfixed desktop controller. Install the pinned dependencies with `npm ci` in `source/build`. Before running `npm ci` in `source/vendor/framework7-react`, copy the reviewed `mobile-package-lock.json` there as `package-lock.json`. Upstream omitted that lock; it was reconstructed from the qualified Mac build's installed graph, preserving all 1,097 installed package versions and adding missing foreign-platform optional package metadata. A dry-run clean install validates the repaired lock.

From this directory, run `node build-theme.mjs`. `EURO_SOURCE_ROOT` and `EURO_BUILD_ROOT` may point to separate local directories. The wrapper merges translation fallbacks, runs upstream build targets sequentially, verifies locale completeness, then applies the five static copy overlays from `prepare-copy.mjs`. It neither builds a Docker image nor creates, uploads or publishes source archives.

`prepare-copy.mjs INPUT OUTPUT` can also be run separately on a qualified web-apps tree. It writes only two locale titles and three English help pages to a separate output directory, with a file manifest. The error titles retain the limit's meaning. Adapted help retains original technical-content attribution, adds a dated CC BY-SA notice and describes browser use. Neither SDK code nor license/feature gates are changed.

The theme promotes Soạn Văn Bản in title, header, loader and service publisher/support fields. Attribution still identifies Euro-Office and ONLYOFFICE by Ascensio System SIA. Original About artwork and legal notices are retained; this does not assert that every upstream About sentence is immutable. The official [branded-build guide](https://euro-office.github.io/documentation/development/building/#build-a-branded-image) supports changing product branding.

`Dockerfile` describes the custom frontend layer on the pinned image. Reproducing the earlier font-preservation layer also needs a locally supplied `preserved-fonts.tar`; it is ignored and must not be committed. Preserve filename case and review the font rights independently. Building or switching a live image needs separate release qualification and authorization.

## Resume overlay and publication boundary

The Dockerfile copies `connection-status.js` and runs `install-resume-observer.py` after installing the built web-apps tree. The installer adds the observer to both main/mobile HTML and sets `services.CoAuthoring.server.savetimeoutdelay` to 90000 milliseconds. Native SDK bundles remain unchanged. The read-only plugin method `SVBConnectionStatus` reports the native connection state; it does not initiate disconnect, reconnect, refresh or document commands.

Deploy this overlay with the matching plugin bridge and application integration that persists signed final saves without prematurely revoking a still-valid run lease. Explicit close, authorization, revision/epoch fencing and expiry must remain enforced. Installing the grace alone does not resolve the application-side callback issue. JWT/token expiry, roles and existing negotiated native retries are unchanged.

Retain LICENSE, ATTRIBUTION, all applicable original notices and matching public preferred-source links. Published upstream snapshots remain filtered text-source snapshots; exact upstream URLs identify omitted fonts/binary inputs that must be acquired under their applicable rights. The legacy live-7 archive is historical; these current files supply the later branding/resume overlay. Source publication does not establish that a separately private wrapper is outside any covered combined work or certify complete legal scope.

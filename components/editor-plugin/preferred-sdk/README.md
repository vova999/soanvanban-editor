# Exact official plugin SDK preferred source

`plugins.dev.js` is the editable client SDK published together with the byte-matching `plugins.js` at ONLYOFFICE/onlyoffice.github.io commit `c2d42ebc6ef4b454246a6c87e21630bc33440ae9`, under `sdkjs-plugins/v1/`. Both files last changed in that commit. The deployed/copied distribution SHA-256 is `1bc0bd71eebcb477ceaaee3ab00ed1a10ce7eae117ec68ae8024645c435f524e`. Its original copyright/AGPL additional-term header and the upstream LICENSE are retained unchanged.

Run `npm ci --ignore-scripts`, then `npm run build`. The pinned Apache-2.0 Closure compiler JS package runs without Java. The local wrapper retains the preferred-source legal header and writes only `dist/rebuilt-sdk.js`. This rebuild succeeds without errors, but its compiler output differs from the vendor's distributed bytes; it is not a qualified replacement. The official repository does not provide an exact minifier version/command for the distributed file. Do not replace `../assets/sdk.js` without separate native desktop/mobile qualification.

The editor injects further API initialization from the pinned native SDK component. Full `sdkjs` preferred source and its build/install scripts are included in the upstream source inventory. This client file alone is not full DocumentServer Corresponding Source.

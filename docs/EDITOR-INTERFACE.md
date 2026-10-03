# Application/editor interface (local preparation)

The application backend and plugin asset server are independently runnable processes. The plugin process imports only Node built-ins, serves an exact asset allowlist, and has no application dependencies, credentials or database. The app's `server/plugin-assets.js` fetches GET assets from a fixed `PLUGIN_INTERNAL_ORIGIN`; it never forwards browser cookies, Authorization, query strings or bodies. It rejects redirects, arbitrary paths, responses over 2 MiB and failures (503), with a five-second timeout. GET and HEAD are supported. `/plugin/index.html`, `config.json`, `bootstrap.js`, `sdk.js` and `bridge.js` retain their public URLs. No admin/document endpoint is proxied.

The service accepts only public `APP_ORIGIN` and `EDITOR_PUBLIC_ORIGIN` plus listening HOST/PORT. CSP permits framing by those two explicit origins; evaluation is confined to the plugin frame because the copied SDK requires it. `bootstrap.js` is loaded before the SDK and blocks string messages unless they come from the actual parent editor window at its configured origin. It does not accept a referrer-derived origin.

The browser initializes the editor with GUID `asc.{C73CF738-4B23-4A77-AE4F-E802B791E861}`, autostart enabled, and `/plugin/config.json`. This is a Word-only background plugin. The customized native desktop controller needs the existing three-line background-plugin patch; stock desktop is not a validated substitute.

The plugin's `location.origin` is the public app origin because assets pass through the app. It announces `{type:"soanvanban:ready"}` to `window.top`. The application sends `{type:"soanvanban:request", requestId, action, text?, expected?, checkDocument?}` to that plugin window. The plugin accepts only messages from `window.top` at the same app origin. Replies are `{type:"soanvanban:reply",requestId,result,error}`; the app checks origin, source window and pending request ID. Existing timeout behavior is unchanged.

| Action | Inputs | Editor operation and result |
| --- | --- | --- |
| `selection` | requestId | `GetSelectedText`, text string with unchanged selection options |
| `text` | requestId | `callCommand` reads `Api.GetDocument().GetText()` |
| `append` | nonempty text, expected string, optional checkDocument | Text at most 20,000 characters; optionally verifies whole document still equals expected; adds paragraphs as a native undoable operation; true or stale-document error |
| `accept` | text, expected selection string | Text at most 20,000 characters; checks current selection equals expected before PasteText; true or stale-selection error |

No AI provider or credential is used by the plugin. The application owns consent, AI requests, budget and suggestion UI. The bridge transports selection/document text to the same app window for those features and browser recovery. It invokes editor APIs and runs command functions inside the editor. This is still meaningful browser coupling, even though the asset server and backend are separate.

Other unchanged boundaries: the backend calls the editor's command/converter HTTP endpoints with server-side JWTs; the editor fetches signed document URLs and sends authenticated save callbacks. The browser shell loads the upstream DocsAPI script in its own window and embeds the native editor iframe. UniKey tables remain directly imported by backend conversion. These connections require ownership/combined-work review; process or repository separation alone is not legal clearance.

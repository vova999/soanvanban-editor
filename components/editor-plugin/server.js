// Independent public asset server: no application imports, credentials, or document storage.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

function publicOrigin(value) {
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash)
    throw new Error("Expected an HTTP(S) origin without credentials or path");
  return url.origin;
}
export function createPluginServer({ appOrigin = "http://localhost:3100", editorOrigin = "http://localhost:8080" } = {}) {
  appOrigin = publicOrigin(appOrigin);
  editorOrigin = publicOrigin(editorOrigin);
  const files = new Map([
    ["/plugin/index.html", ["index.html", "text/html; charset=utf-8"]],
    ["/plugin/config.json", ["config.json", "application/json; charset=utf-8"]],
    ["/plugin/sdk.js", ["sdk.js", "application/javascript; charset=utf-8"]],
    ["/plugin/bridge.js", ["bridge.js", "application/javascript; charset=utf-8"]],
    ["/plugin/bootstrap.js", [null, "application/javascript; charset=utf-8"]],
  ]);
  const bootstrap = `// Guard ONLYOFFICE's eval-based SDK bootstrap to the configured parent frame only.\nwindow.addEventListener('message',function(e){if(typeof e.data==='string'&&(e.source!==window.parent||e.origin!==${JSON.stringify(editorOrigin)}))e.stopImmediatePropagation();},true);`;
  return createServer(async (req, res) => {
    const pathname = req.url.split("?")[0];
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-cache");
    if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405, { Allow: "GET, HEAD" }); return res.end(); }
    if (pathname === "/health") { res.writeHead(200, { "Content-Type": "application/json" }); return res.end(req.method === "HEAD" ? undefined : '{"ok":true}'); }
    const entry = files.get(pathname);
    if (!entry) { res.writeHead(404); return res.end(); }
    // The SDK's evaluation exception is confined to this guarded plugin frame.
    res.setHeader("Access-Control-Allow-Origin", editorOrigin);
    res.setHeader("Content-Security-Policy", `default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors ${appOrigin} ${editorOrigin}; object-src 'none'; base-uri 'none'`);
    try {
      const body = entry[0] ? await readFile(new URL("./assets/" + entry[0], import.meta.url)) : Buffer.from(bootstrap);
      res.writeHead(200, { "Content-Type": entry[1], "Content-Length": body.length });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch { res.writeHead(503); res.end(); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createPluginServer({ appOrigin: process.env.APP_ORIGIN, editorOrigin: process.env.EDITOR_PUBLIC_ORIGIN });
  server.listen(Number(process.env.PORT || 3102), process.env.HOST || "127.0.0.1");
  process.on("SIGTERM", () => server.close());
  process.on("SIGINT", () => server.close());
}

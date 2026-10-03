import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { createPluginServer } from "../server.js";

test("standalone service exposes only guarded public assets", async (t) => {
  const server = createPluginServer({ appOrigin: "https://app.example", editorOrigin: "https://editor.example" });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const file of ["index.html", "config.json", "sdk.js", "bridge.js", "bootstrap.js"]) {
    const response = await fetch(origin + "/plugin/" + file);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://editor.example");
    assert.match(response.headers.get("content-security-policy"), /frame-ancestors https:\/\/app.example https:\/\/editor.example/);
    assert.equal(response.headers.get("set-cookie"), null);
    assert.ok((await response.text()).length);
  }
  for (const path of ["/.env", "/server.js", "/plugin/LICENSE", "/plugin/%2e%2e%2fserver.js", "/plugin/not-found.js"])
    assert.equal((await fetch(origin + path)).status, 404);
  assert.equal((await fetch(origin + "/plugin/config.json", { method: "POST" })).status, 405);
  const head = await fetch(origin + "/plugin/sdk.js", { method: "HEAD" });
  assert.equal(head.status, 200); assert.equal(await head.text(), "");
  const code = await (await fetch(origin + "/plugin/bootstrap.js")).text();
  let listener;
  const parent = {};
  vm.runInNewContext(code, { window: { parent, addEventListener: (type, fn, capture) => { assert.equal(type, "message"); assert.equal(capture, true); listener = fn; } } });
  for (const [source, origin, expected] of [[parent,"https://editor.example",false],[{},"https://editor.example",true],[parent,"https://attacker.example",true]]) {
    let stopped = false;
    listener({ source, origin, data: "eval bootstrap", stopImmediatePropagation: () => { stopped = true; } });
    assert.equal(stopped, expected);
  }
});
test("service rejects non-origin configuration", () => {
  for (const origin of ["file:///tmp", "https://user:password@host", "https://host/path", "https://host/?x=1"])
    assert.throws(() => createPluginServer({ editorOrigin: origin }));
});
test("bridge ignores other windows and rejects a changed selection", async () => {
  const code = await readFile(new URL("../assets/bridge.js", import.meta.url), "utf8");
  const top = {}, replies = [], calls = [];
  top.postMessage = (data, origin) => replies.push({ data, origin });
  let handler;
  const plugin = { executeMethod: (name, args, callback) => { calls.push(name); if (name === "GetSelectedText") callback("changed text"); } };
  vm.runInNewContext(code, { location: { origin: "https://app.example" }, window: { top, Asc: { plugin }, addEventListener: (_, fn) => { handler = fn; } } });
  const data = { type: "soanvanban:request", requestId: "request-1", action: "accept", text: "replacement", expected: "original" };
  handler({ origin: "https://attacker.example", source: top, data });
  handler({ origin: "https://app.example", source: {}, data });
  assert.equal(calls.length, 0);
  handler({ origin: "https://app.example", source: top, data });
  assert.deepEqual(calls, ["GetSelectedText"]);
  assert.equal(replies[0].data.requestId, "request-1");
  assert.ok(replies[0].data.error); assert.equal(replies[0].origin, "https://app.example");
});

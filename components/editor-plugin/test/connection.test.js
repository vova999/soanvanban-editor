import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

test("native observer distinguishes auth, retry and terminal states; isolated plugin only dispatches read-only methods", async () => {
  const bridge = await readFile(
    new URL("../assets/bridge.js", import.meta.url),
    "utf8",
  );
  const observer = await readFile(
    new URL(
      "../../../deploy/euro-office/connection-status.js",
      import.meta.url,
    ),
    "utf8",
  );
  let value = 2,
    handler;
  const replies = [],
    methods = [];
  const editor = {
    CoAuthoringApi: { get_state: () => value },
    isDocumentModified: () => true,
  };
  const states = {
    Reconnect: -1,
    Authorized: 2,
    ClosedCoAuth: 3,
    ClosedAll: 4,
    SaveChanges: 10,
    AskSaveChanges: 11,
  };
  vm.runInNewContext(observer, {
    window: { Asc: { editor }, AscCommon: { ConnectionState: states } },
  });
  const top = { postMessage: (data) => replies.push(data) };
  const plugin = {
    callCommand: () => {
      throw new Error("Connection observation must not execute a command");
    },
    executeMethod: (name, args, callback) => {
      methods.push(name);
      callback(editor["pluginMethod_" + name].apply(editor, args));
    },
  };
  vm.runInNewContext(bridge, {
    location: { origin: "http://app.example" },
    window: {
      top,
      Asc: { plugin },
      addEventListener: (_, fn) => {
        handler = fn;
      },
    },
  });
  plugin.init();
  for (const [state, expected] of [
    [-1, "reconnecting"],
    [1, "reconnecting"],
    [2, "connected"],
    [3, "terminal"],
    [4, "terminal"],
    [10, "connected"],
    [11, "connected"],
  ]) {
    value = state;
    handler({
      source: top,
      origin: "http://app.example",
      data: {
        type: "soanvanban:request",
        requestId: "test",
        action: "connection",
      },
    });
    assert.equal(replies.at(-1).result.state, expected);
    assert.equal(replies.at(-1).result.modified, true);
  }
  handler({
    source: top,
    origin: "http://attacker.example",
    data: {
      type: "soanvanban:request",
      requestId: "test",
      action: "connection",
    },
  });
  assert.equal(methods.length, 7);
});

test("observer installation is bounded and incompatible engines remain unknown", async () => {
  const observer = await readFile(
    new URL(
      "../../../deploy/euro-office/connection-status.js",
      import.meta.url,
    ),
    "utf8",
  );
  let tick,
    cleared = 0;
  vm.runInNewContext(observer, {
    window: { addEventListener: () => {} },
    setInterval: (fn) => {
      tick = fn;
      return 1;
    },
    clearInterval: () => cleared++,
  });
  for (let i = 0; i < 900; i++) tick();
  assert.equal(cleared, 1);
});

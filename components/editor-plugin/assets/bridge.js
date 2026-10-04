/* soanvanban.com bridge uses ONLYOFFICE's free plugin API. No commercial connector API. */
(function () {
  const origin = location.origin;
  const selectionOptions = {
    Numbering: false,
    Math: false,
    TableCellSeparator: "\t",
    ParaSeparator: "\n",
    TabSymbol: "\t",
    NewLineSeparator: "\n",
  };
  function reply(requestId, result, error) {
    window.top.postMessage(
      { type: "soanvanban:reply", requestId, result, error },
      origin,
    );
  }
  window.Asc.plugin.init = function () {
    window.top.postMessage({ type: "soanvanban:ready" }, origin);
  };
  window.Asc.plugin.button = function () {};
  window.addEventListener("message", function (event) {
    if (
      event.origin !== origin ||
      event.source !== window.top ||
      event.data?.type !== "soanvanban:request"
    )
      return;
    const { requestId, action, text, expected } = event.data;
    if (action === "connection")
      // Read-only adapter for the pinned 9.3.4 SDK. This observes its native
      // reconnect state; it never calls socket/connect/disconnect or refresh.
      // Unknown versions fail closed instead of treating a responsive frame
      // (or an application heartbeat) as an authorized editing connection.
      window.Asc.plugin.executeMethod("SVBConnectionStatus", [], (result) =>
        reply(requestId, result),
      );
    else if (action === "snapshot")
      window.Asc.plugin.executeMethod("GetFileToDownload", ["docx"], (url) =>
        typeof url === "string" && url !== "error"
          ? reply(requestId, url)
          : reply(requestId, null, "Snapshot export failed"),
      );
    else if (action === "selection")
      window.Asc.plugin.executeMethod(
        "GetSelectedText",
        [selectionOptions],
        (result) => reply(requestId, result),
      );
    else if (action === "text")
      window.Asc.plugin.callCommand(
        function () {
          return Api.GetDocument().GetText();
        },
        false,
        false,
        (result) => reply(requestId, result),
      );
    else if (action === "append") {
      if (
        typeof text !== "string" ||
        !text.trim() ||
        text.length > 20000 ||
        typeof expected !== "string"
      )
        return reply(requestId, null, "Invalid suggestion");
      Asc.scope.soanvanbanAppend = {
        text,
        expected,
        checkDocument: event.data.checkDocument === true,
      };
      window.Asc.plugin.callCommand(
        function () {
          const data = Asc.scope.soanvanbanAppend;
          const doc = Api.GetDocument();
          if (data.checkDocument && doc.GetText() !== data.expected)
            return false;
          for (const line of data.text.split(/\r?\n/)) {
            const paragraph = Api.CreateParagraph();
            paragraph.AddText(line);
            doc.Push(paragraph);
          }
          return true;
        },
        false,
        true,
        (ok) => {
          reply(
            requestId,
            ok,
            ok
              ? undefined
              : "Nội dung tài liệu đã thay đổi. Hãy xem lại văn bản và tạo đề xuất mới.",
          );
        },
      );
    } else if (action === "accept") {
      if (
        typeof text !== "string" ||
        text.length > 20000 ||
        typeof expected !== "string"
      )
        return reply(requestId, null, "Invalid suggestion");
      window.Asc.plugin.executeMethod(
        "GetSelectedText",
        [selectionOptions],
        (selected) => {
          if (selected !== expected)
            return reply(
              requestId,
              null,
              "Vùng chọn đã thay đổi. Hãy chọn lại đúng đoạn văn trước khi áp dụng.",
            );
          window.Asc.plugin.executeMethod("PasteText", [text], () =>
            reply(requestId, true),
          );
        },
      );
    }
  });
})();

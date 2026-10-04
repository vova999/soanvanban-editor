/* Read-only integration observer for the pinned Euro-Office 9.3.4 SDK.
 * Native socket retry/reauthorization owns reconnection. This file never calls
 * connect, disconnect, refresh, save, or editor commands and never reads text,
 * document keys, users, JWTs, or other credentials.
 * Expose metadata through the SDK's existing plugin-method dispatcher, avoiding
 * callCommand transactions or weakening the isolated plugin evaluation scope.
 */
(function () {
  function install() {
    const editor = window.Asc?.editor;
    const states = window.AscCommon?.ConnectionState;
    if (
      !editor ||
      !states ||
      typeof editor.CoAuthoringApi?.get_state !== "function"
    )
      return false;
    editor.pluginMethod_SVBConnectionStatus = function () {
      const value = this.CoAuthoringApi.get_state();
      return {
        state: [
          states.Authorized,
          states.SaveChanges,
          states.AskSaveChanges,
        ].includes(value)
          ? "connected"
          : [states.ClosedAll, states.ClosedCoAuth].includes(value)
            ? "terminal"
            : "reconnecting",
        modified:
          typeof this.isDocumentModified === "function"
            ? this.isDocumentModified()
            : null,
      };
    };
    return true;
  }
  // The native API is constructed asynchronously by the existing editor loader.
  // Installation is bounded; missing/incompatible SDKs remain unknown to the app.
  let attempts = 0;
  if (install()) return;
  const timer = setInterval(function () {
    if (install() || ++attempts >= 900) clearInterval(timer);
  }, 100);
  window.addEventListener(
    "pagehide",
    function () {
      clearInterval(timer);
    },
    { once: true },
  );
})();

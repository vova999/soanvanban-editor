# Native resume integration overlay

This release updates the standalone plugin bridge, its connection tests and the native build/observer/install inputs. It contains no private application wrapper/backend code, credentials, user documents, font binaries or new compiled SDK output.

The native SDK retains responsibility for transport retries and replay of its own buffer. The observer exposes native states through the existing plugin interface so an integrating application can preserve an existing unsaved frame, bound its checks and require persistence evidence before claiming a save. It is read-only and requires no relaxed sandbox or eval capability.

The installer sets a 90-second participant-disconnect assembly grace, matching the qualified application's existing run lease. Durable final-save callbacks and explicit close/authorization/expired-run fencing must accompany this setting. Native token/JWT validation, idle/absolute expiry and retry parameters remain unchanged.

Run `npm test` in components/editor-plugin. Build the pinned upstream web-apps/theme inputs using deploy/euro-office/README.md, then use its Dockerfile with separately licensed font inputs. The observer file's date suffix identifies the actual installed filename and must match the installer. No native SDK bundle is patched.

Qualified evidence includes desktop and emulated Android VI/EN 5/15/30-second resume cycles, unsaved-buffer recovery, genuine expired-run takeover and save/export checks. Physical iOS background suspension/process eviction and interruptions beyond the native cache/retry window remain device-validation limits. This is not a guarantee of full-fidelity offline recovery or complete Corresponding Source scope.

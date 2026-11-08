# Windows Release Status

**Status: Not yet released**

The current PyInstaller build was generated successfully and includes the two required MediaPipe task model files. However, the executable is unsigned.

On the developer's Windows 11 Home machine, the active `VerifiedAndReputableDesktop` Code Integrity policy blocked the executable (Code Integrity event 3077). The source application launched successfully from the Python environment.

## What remains

- Determine an appropriate trusted code-signing path compatible with the active Windows policy.
- Sign the release executable if the selected distribution route requires it.
- Verify the signed executable under the target Windows policy.
- Test the packaged application on a clean Windows machine.
- Publish a release archive only after those checks pass.

This repository intentionally does not include the currently blocked executable.

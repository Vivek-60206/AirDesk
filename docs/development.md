# Development and Testing

This public repository is a documentation/showcase package. It does not include the private application source tree.

## Verified development facts

- The developer launched the desktop application from its Python source environment on Windows.
- The developer reported successful manual checks of the application interactions.
- On 12 November 2026, the private core's automated suite passed 162 tests. The private implementation tests are not included in this public showcase repository.
- A PyInstaller build completed, but its unsigned executable was blocked by the developer machine's active Code Integrity policy.

These are developer-reported results, not a claim that every Windows configuration or hardware combination has been tested.

## Development environment

The private source project uses Python 3.13 and the following principal dependencies:

- NumPy
- OpenCV
- MediaPipe
- PySide6
- PyAutoGUI
- scikit-learn
- Pytest

## Release validation

A public Windows binary should only be published after:

1. A trusted signing strategy is established where required.
2. The executable is tested on a clean Windows environment.
3. Camera access and each gesture are checked.
4. Pause/resume and Emergency Stop are verified.
5. The release archive is validated and its contents documented.

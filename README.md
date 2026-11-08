# AirDesk

### Your Desktop. Your Gestures. Your Control.

AirDesk is a Windows desktop application that turns hand gestures into computer interactions using a webcam, computer vision, and gesture recognition.

Move the pointer, click, scroll, and control system volume without relying on a conventional mouse for every action.

## What it does

- Real-time webcam-based hand tracking
- Gesture-driven pointer movement
- Pinch-based left click
- Two-finger Victory gesture for scrolling
- Thumb gestures for volume control
- Closed-fist gesture for mute/unmute
- Desktop Control Center with camera and interaction status
- Pause/resume and Emergency Stop controls

## Gesture reference

| Gesture | Action |
|---|---|
| Index Finger | Move cursor |
| Pinch | Left click |
| Victory (two fingers) | Scroll |
| Thumb Up | Volume up |
| Thumb Down | Volume down |
| Closed Fist | Mute / unmute |

Gesture recognition and system actions are performed locally by the desktop application. Actual behaviour can depend on camera placement, lighting, and tracking conditions.

## Technology

- Python
- OpenCV
- MediaPipe
- NumPy
- PySide6
- PyAutoGUI
- scikit-learn
- Pytest

## Project status

The Python source application has been launched and manually exercised on the developer's Windows machine. The automated test suite previously reported 155 passing tests.

The standalone PyInstaller executable is **not yet a verified release**. On the developer's Windows 11 system, the active Smart App Control / Code Integrity policy blocked the unsigned executable. A trusted signing and compatibility path still needs to be established.

No installer or executable is included in this public package at this stage.

## Documentation

- [Architecture](docs/architecture.md)
- [Gesture guide](docs/gestures.md)
- [Development and testing](docs/development.md)
- [Windows release status](docs/release-status.md)

## Screenshots

Screenshots will be added here after the final public-facing UI captures are selected. No placeholder or fabricated product screenshots are included.

## Repository layout

```text
AirDesk/
|-- assets/
|   `-- screenshots/
|       `-- README.md
|-- docs/
|   |-- architecture.md
|   |-- development.md
|   |-- gestures.md
|   `-- release-status.md
|-- release/
|   `-- README.md
|-- .gitignore
|-- LICENSE
`-- README.md
```
## License

All rights reserved. See [LICENSE](LICENSE).

This repository is a public product showcase and documentation package. It does not contain the private production source code.

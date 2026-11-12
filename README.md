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

## Try the browser demo

The public website includes an interactive camera demo for hand tracking, virtual cursor movement, and pinch clicks inside a test area on the page. It does not control the visitor's operating system.

- Website: <https://vivek-60206.github.io/AirDesk/>
- Camera access starts only after the visitor presses **Start camera demo**.
- The demo requests video only; it does not request microphone access.
- Video frames are processed in the browser and are not uploaded by this demo.
- MediaPipe sends usage and performance metrics to Google. See [MediaPipe's package privacy notice](https://www.npmjs.com/package/@mediapipe/tasks-vision).
- Camera processing stops when the visitor presses **Stop** or leaves the page.

The browser demo is a showcase experience, not the native Windows application. Its website source is public under this repository's all-rights-reserved notice. The private production desktop source and system-control implementation remain in the separate private `AirDesk-Core` repository and are not part of this public project.

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

The Python source application has been launched and manually exercised on the developer's Windows machine. On 12 November 2026, the private core's automated suite passed 162 tests. Those implementation tests are not part of this public showcase repository.

The standalone PyInstaller executable is **not yet a verified release**. On the developer's Windows 11 system, the active Smart App Control / Code Integrity policy blocked the unsigned executable. A trusted signing and compatibility path still needs to be established.

No installer or executable is included in this public package at this stage.

## Documentation

- [Architecture](docs/architecture.md)
- [Gesture guide](docs/gestures.md)
- [Development and testing](docs/development.md)
- [Windows release status](docs/release-status.md)

## Screenshots

Screenshots will be added here after the final public-facing UI captures are selected. No placeholder or fabricated product screenshots are included.

## Website deployment

The site is configured to deploy to GitHub Pages from `main` through `.github/workflows/pages.yml`. In repository settings, GitHub Pages must use **GitHub Actions** as its deployment source. After the first successful workflow run, the site is available at <https://vivek-60206.github.io/AirDesk/>.

## Repository layout

```text
AirDesk/
|-- .github/workflows/pages.yml
|-- assets/
|   `-- website/airdesk-mark.svg
|-- docs/
|-- release/README.md
|-- scripts/validate_site.py
|-- demo.css
|-- demo.js
|-- index.html
|-- script.js
|-- styles.css
|-- LICENSE
`-- README.md
```
## License

All rights reserved. See [LICENSE](LICENSE).

This repository is a public product showcase and documentation package. It does not contain the private production source code.

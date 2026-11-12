# AirDesk - Architecture Overview

## Product overview

AirDesk is a Windows desktop application that translates webcam-based hand tracking and recognized gestures into desktop interactions.

## Processing pipeline

1. Capture frames from the webcam.
2. Process frames with computer-vision and hand-tracking components.
3. Extract hand landmarks and motion information.
4. Recognize the supported gesture.
5. Validate the gesture and apply interaction safeguards.
6. Send the approved action to the desktop-control layer.
7. Present camera, status, and control information in the PySide6 interface.

## Main application areas

| Area | Responsibility |
|---|---|
| Camera capture | Webcam initialization and frame acquisition |
| Vision | Hand detection, landmark extraction, tracking |
| Intelligence | Gesture recognition and smoothing |
| Desktop controller | Pointer, click, scroll, and media/volume actions |
| Safety | Pause and emergency-stop behaviour |
| Desktop UI | Control Center, status, and user controls |

## Runtime and privacy

The native Windows application uses the local webcam and performs its desktop interactions on the user's computer. Camera access must be granted by Windows. The separate browser demo has its own camera and third-party metrics disclosures below.

## Public website demo

The GitHub Pages site is a separate static browser experience. When a visitor chooses **Start camera demo**, the browser requests video-only camera access and runs MediaPipe Gesture Recognizer locally using its pinned WebAssembly package and public model asset. The demo maps hand position to a virtual cursor and permits pinch clicks on controls inside a simulated desktop workspace. It has no backend and cannot move the operating-system cursor or send desktop input.

Camera frames are processed on the visitor's device and are not uploaded by this demo. The pinned SDK bundle includes a Google logging endpoint, and Google's [MediaPipe privacy notice](https://developers.google.com/edge/mediapipe/solutions/privacy) describes usage and performance metrics sent by MediaPipe Tasks. The live demo links to this notice before camera use. It also loads the SDK and model from third-party hosts. The camera stream is stopped when the visitor presses **Stop**, switches away from the page, or leaves it. The public source and third-party package/model assets are not the private desktop implementation.

## Platform scope

The current tested desktop target is Windows. macOS and Linux support are not claimed as available releases.

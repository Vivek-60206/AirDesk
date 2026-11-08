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

The application uses the local webcam and performs its desktop interaction on the user's computer. Camera access must be granted by Windows. This package does not make claims about third-party cloud processing.

## Platform scope

The current tested desktop target is Windows. macOS and Linux support are not claimed as available releases.

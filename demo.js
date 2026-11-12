const TASKS_MODULE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/vision_bundle.mjs";
const TASKS_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm";
const GESTURE_MODEL = "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";
const MAX_INFERENCE_WIDTH = 480;
const MAX_INFERENCE_HEIGHT = 360;
const MIN_INFERENCE_INTERVAL_MS = 50;

const video = document.querySelector("#camera-video");
const canvas = document.querySelector("#landmark-canvas");
const context = canvas.getContext("2d");
const inferenceCanvas = document.createElement("canvas");
const inferenceContext = inferenceCanvas.getContext("2d", { alpha: false });
const cameraFrame = document.querySelector("#camera-frame");
const startButton = document.querySelector("#camera-start");
const stopButton = document.querySelector("#camera-stop");
const cameraNote = document.querySelector("#camera-note");
const stateBadge = document.querySelector("#demo-state");
const stateText = document.querySelector("#demo-state-text");
const gestureName = document.querySelector("#gesture-name");
const gestureConfidence = document.querySelector("#gesture-confidence");
const clickCount = document.querySelector("#gesture-click-count");
const playground = document.querySelector("#gesture-playground");
const cursor = document.querySelector("#playground-cursor");
const cursorLabel = document.querySelector("#playground-cursor-label");
const coordinates = document.querySelector("#playground-coordinates");
const desktopWindow = document.querySelector("#desktop-window");
const desktopWindowTitle = document.querySelector("#desktop-window-title");
const desktopWindowContent = document.querySelector("#desktop-window-content");
const desktopTaskbarStatus = document.querySelector("#desktop-taskbar-status");
const desktopIcons = document.querySelector(".desktop-icons");

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

let activeStream = null;
let recognizer = null;
let animationFrame = 0;
let sessionId = 0;
let lastInferenceAt = 0;
let previousVideoTime = -1;
let previousPinch = false;
let totalClicks = 0;
let demoVolume = 6;

function setStatus(state, message) {
  stateBadge.dataset.state = state;
  stateText.textContent = message;
}

function drawLandmarks(handLandmarks) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!handLandmarks) return;

  context.lineWidth = Math.max(2, canvas.width / 320);
  context.strokeStyle = "rgba(203, 182, 139, .86)";
  context.fillStyle = "#f1d89f";
  for (const [start, end] of HAND_CONNECTIONS) {
    context.beginPath();
    context.moveTo(handLandmarks[start].x * canvas.width, handLandmarks[start].y * canvas.height);
    context.lineTo(handLandmarks[end].x * canvas.width, handLandmarks[end].y * canvas.height);
    context.stroke();
  }

  const radius = Math.max(2, canvas.width / 150);
  for (const point of handLandmarks) {
    context.beginPath();
    context.arc(point.x * canvas.width, point.y * canvas.height, radius, 0, Math.PI * 2);
    context.fill();
  }
}

function findPlaygroundTarget(x, y) {
  const bounds = playground.getBoundingClientRect();
  const screenX = bounds.left + x * bounds.width;
  const screenY = bounds.top + y * bounds.height;
  const element = document.elementFromPoint(screenX, screenY);
  const target = element?.closest("[data-gesture-target]");
  return target && playground.contains(target) ? target : null;
}

function updatePlayground(handLandmarks, pinching) {
  const tip = handLandmarks[8];
  const x = Math.max(0.02, Math.min(0.98, 1 - tip.x));
  const y = Math.max(0.02, Math.min(0.98, tip.y));
  cursor.style.left = `${x * 100}%`;
  cursor.style.top = `${y * 100}%`;
  cursor.classList.add("visible");
  cursor.classList.toggle("pinch", pinching);
  cursorLabel.textContent = pinching ? "PINCH" : "VIRTUAL CURSOR";
  coordinates.textContent = `X ${Math.round(x * 100)} / Y ${Math.round(y * 100)}`;

  if (pinching && !previousPinch) {
    const target = findPlaygroundTarget(x, y);
    if (target) target.click();
  }
  previousPinch = pinching;
}

function renderResult(result) {
  const hand = result.landmarks?.[0];
  if (!hand) {
    drawLandmarks(null);
    cursor.classList.remove("visible", "pinch");
    cursorLabel.textContent = "VIRTUAL CURSOR";
    coordinates.textContent = "X — / Y —";
    gestureName.textContent = "No hand";
    gestureConfidence.textContent = "—";
    previousPinch = false;
    return;
  }

  drawLandmarks(hand);
  const category = result.gestures?.[0]?.[0];
  gestureName.textContent = category?.categoryName?.replaceAll("_", " ") || "Hand detected";
  gestureConfidence.textContent = category ? `${Math.round(category.score * 100)}%` : "—";

  const thumb = hand[4];
  const index = hand[8];
  const dx = (thumb.x - index.x) * video.videoWidth;
  const dy = (thumb.y - index.y) * video.videoHeight;
  const pinching = Math.hypot(dx, dy) < video.videoWidth * 0.055;
  updatePlayground(hand, pinching);
}

function processFrame(now) {
  if (!recognizer || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    animationFrame = requestAnimationFrame(processFrame);
    return;
  }

  if (video.currentTime !== previousVideoTime && now - lastInferenceAt >= MIN_INFERENCE_INTERVAL_MS) {
    previousVideoTime = video.currentTime;
    lastInferenceAt = now;
    try {
      inferenceContext.drawImage(video, 0, 0, inferenceCanvas.width, inferenceCanvas.height);
      renderResult(recognizer.recognizeForVideo(inferenceCanvas, Math.round(now)));
    } catch (error) {
      const message = `Gesture tracking stopped: ${error.message || "the camera frame could not be processed."}`;
      stopDemo();
      setStatus("error", "Tracking stopped");
      cameraNote.textContent = message;
      return;
    }
  }

  animationFrame = requestAnimationFrame(processFrame);
}

function releaseResources() {
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  if (recognizer) {
    try {
      recognizer.close();
    } catch {
      // Always release the camera even if the runtime fails during shutdown.
    } finally {
      recognizer = null;
    }
  }
  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
  }
  video.srcObject = null;
  cameraFrame.classList.remove("active");
  context.clearRect(0, 0, canvas.width, canvas.height);
  cursor.classList.remove("visible", "pinch");
  previousPinch = false;
  previousVideoTime = -1;
}

function stopDemo() {
  sessionId += 1;
  releaseResources();
  startButton.disabled = false;
  stopButton.disabled = true;
  setStatus("idle", "Camera off");
  cameraNote.textContent = "Camera off. Start again whenever you’re ready.";
  gestureName.textContent = "Waiting";
  gestureConfidence.textContent = "—";
  coordinates.textContent = "X — / Y —";
  cursorLabel.textContent = "VIRTUAL CURSOR";
}

function describeCameraError(error) {
  if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
    return "Camera permission was denied. Allow camera access in your browser settings, then try again.";
  }
  if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
    return "No camera was found. Connect a camera and try again.";
  }
  if (!window.isSecureContext) {
    return "Camera access needs HTTPS or localhost. Open the GitHub Pages site or run the local server instructions.";
  }
  return `Could not start the camera demo: ${error?.message || "check your camera and network connection."}`;
}

async function startDemo() {
  const requestId = ++sessionId;
  startButton.disabled = true;
  setStatus("loading", "Requesting camera");
  cameraNote.textContent = "Your browser will ask for camera permission. No audio is requested.";

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("This browser does not provide camera access. Use a current browser over HTTPS.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: MAX_INFERENCE_WIDTH },
        height: { ideal: 480 },
        facingMode: { ideal: "user" },
      },
    });
    if (requestId !== sessionId) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    activeStream = stream;
    video.srcObject = stream;
    await video.play();
    stopButton.disabled = false;
    setStatus("loading", "Loading gesture model");
    cameraNote.textContent = "Loading MediaPipe on this device. The first visit may take a moment.";

    const { FilesetResolver, GestureRecognizer } = await import(TASKS_MODULE);
    if (requestId !== sessionId) return;
    const vision = await FilesetResolver.forVisionTasks(TASKS_WASM);
    if (requestId !== sessionId) return;
    const recognizerOptions = {
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
    };
    let task;
    let usedCpuFallback = false;
    try {
      task = await GestureRecognizer.createFromOptions(vision, {
        ...recognizerOptions,
        baseOptions: { modelAssetPath: GESTURE_MODEL, delegate: "GPU" },
      });
    } catch {
      if (requestId !== sessionId) return;
      usedCpuFallback = true;
      cameraNote.textContent = "GPU acceleration isn’t available here. Loading the model on your CPU instead.";
      task = await GestureRecognizer.createFromOptions(vision, {
        ...recognizerOptions,
        baseOptions: { modelAssetPath: GESTURE_MODEL },
      });
    }
    if (requestId !== sessionId) {
      task.close();
      return;
    }

    recognizer = task;
    const sourceWidth = video.videoWidth || MAX_INFERENCE_WIDTH;
    const sourceHeight = video.videoHeight || MAX_INFERENCE_HEIGHT;
    const scale = Math.min(
      MAX_INFERENCE_WIDTH / sourceWidth,
      MAX_INFERENCE_HEIGHT / sourceHeight,
      1,
    );
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    inferenceCanvas.width = width;
    inferenceCanvas.height = height;
    canvas.width = width;
    canvas.height = height;
    cameraFrame.classList.add("active");
    startButton.disabled = true;
    stopButton.disabled = false;
    setStatus("active", "Tracking on device");
    cameraNote.textContent = usedCpuFallback
      ? "Using CPU inference. Move your index finger over a demo app and pinch to select it."
      : "Move your index finger over an app or control and pinch to select it.";
    lastInferenceAt = 0;
    animationFrame = requestAnimationFrame(processFrame);
  } catch (error) {
    if (requestId !== sessionId) return;
    releaseResources();
    startButton.disabled = false;
    stopButton.disabled = true;
    setStatus("error", "Demo unavailable");
    cameraNote.textContent = describeCameraError(error);
  }
}

function openDesktopWindow(name) {
  const panels = {
    notes: {
      title: "Notes",
      content: '<p class="desktop-window-message">Welcome to AirDesk. This note stays in the demo workspace.</p><button type="button" data-gesture-target data-desktop-action="save">Save note</button>',
    },
    files: {
      title: "Files",
      content: '<p class="desktop-window-message">This PC<br>Documents&nbsp; · &nbsp;Pictures&nbsp; · &nbsp;Welcome.txt</p><button type="button" data-gesture-target data-desktop-action="file">Open Welcome.txt</button>',
    },
    settings: {
      title: "Quick settings",
      content: `<p>Demo volume: <strong id="demo-volume-level">${demoVolume}</strong></p><div><button type="button" data-gesture-target data-desktop-action="volume-down">Volume −</button> <button type="button" data-gesture-target data-desktop-action="volume-up">Volume +</button></div>`,
    },
  };
  const panel = panels[name];
  if (!panel) return;
  desktopWindowTitle.querySelector("strong").textContent = panel.title;
  desktopWindowContent.innerHTML = panel.content;
  desktopWindow.hidden = false;
  desktopTaskbarStatus.textContent = `${panel.title} open`;
}

function handleDesktopAction(target) {
  const { desktopAction: action, window: windowName } = target.dataset;
  if (action === "open") openDesktopWindow(windowName);
  if (action === "close") {
    desktopWindow.hidden = true;
    desktopTaskbarStatus.textContent = "Ready";
  }
  if (action === "start") {
    desktopIcons.hidden = !desktopIcons.hidden;
    desktopTaskbarStatus.textContent = desktopIcons.hidden ? "Start menu closed" : "Choose an app";
  }
  if (action === "save" || action === "file") {
    const message = desktopWindowContent.querySelector(".desktop-window-message");
    if (message) message.textContent = action === "save" ? "Saved in this demo session." : "Welcome to AirDesk — a gesture-controlled desktop experience.";
    desktopTaskbarStatus.textContent = action === "save" ? "Note saved" : "Welcome.txt open";
  }
  if (action === "volume-up" || action === "volume-down") {
    demoVolume = Math.max(0, Math.min(10, demoVolume + (action === "volume-up" ? 1 : -1)));
    const level = document.querySelector("#demo-volume-level");
    if (level) level.textContent = String(demoVolume);
    desktopTaskbarStatus.textContent = `Demo volume ${demoVolume}`;
  }
}

startButton.addEventListener("click", startDemo);
stopButton.addEventListener("click", stopDemo);
playground.addEventListener("click", (event) => {
  const target = event.target.closest("[data-gesture-target]");
  if (!target || !playground.contains(target)) return;
  totalClicks += 1;
  clickCount.textContent = String(totalClicks);
  handleDesktopAction(target);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && activeStream) stopDemo();
});
window.addEventListener("pagehide", stopDemo);

if (!window.isSecureContext) {
  cameraNote.textContent = "Camera access needs HTTPS or localhost. Open the GitHub Pages site or run the local server instructions.";
}

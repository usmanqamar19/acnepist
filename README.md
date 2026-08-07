# Acnepist

An experimental computer-vision skin-tracking prototype. It runs a device camera through a face-mesh landmark model to visualise a live mesh overlay on the user's face, and pairs that with simple self-tracking screens for daily habits and reflection. The project exists as two front ends sharing one design and feature set: a web app and a mobile app.

It makes no medical or diagnostic claims. The code deliberately avoids clinical language and includes a filter that rewrites clinical wording into everyday wording before any text is shown.

## Who it is for

Anyone who wants an informal way to look at and note changes in their own skin over time. The repository is also a worked example of running face-landmark computer vision in a browser and in a React Native app.

## Key features

**Web (`web/`, Next.js)**

- Live 3D face mesh: MediaPipe `FaceLandmarker` feeds a Three.js point cloud and line segments, animated with GSAP.
- Camera check-in screen using `getUserMedia` for preview and frame capture. The analysis step is a placeholder that returns generated sample output rather than a trained model.
- Habit checklist, a shelf of static product entries, a supportive chat driven by local keyword rules, and a QR code screen for opening the app on a phone.

**Mobile (`mobile/`, React Native and Expo)**

- Camera check-in with `expo-camera`. The captured frame is resized, posted to a hosted Roboflow detection endpoint, and the returned labels and confidence scores are summarised as a text report.
- Animated face mesh overlay drawn natively over the camera preview.
- Chat screen that calls a hosted model through a Puter.js WebView bridge, falling back to local rule-based replies on timeout, with history kept on the device via AsyncStorage.
- Safe-language filter that maps clinical terms to everyday terms.
- Habit checklist and product shelf matching the web versions.

**`mobile/ar mesh/`** holds the standalone browser demo the mesh work grew out of: MediaPipe Face Mesh drawing 468 landmarks onto a canvas, runnable from any static server.

## Architecture

```
                     ┌────────────────────────┐
                     │     Device camera      │
                     └───────────┬────────────┘
                                 │
            ┌────────────────────┴────────────────────┐
            │                                         │
   ┌────────▼──────────┐                   ┌──────────▼────────┐
   │  web/   Next.js   │                   │  mobile/   Expo   │
   │  React 18 + TS    │                   │ React Native + TS │
   └────────┬──────────┘                   └──────────┬────────┘
            │                                         │
   ┌────────▼───────────────┐          ┌──────────────▼──────────────┐
   │ MediaPipe tasks-vision │          │ expo-camera frame capture   │
   │ FaceLandmarker         │          │ + native mesh overlay       │
   │          ↓             │          │          ↓                  │
   │ Three.js point cloud   │          │ Roboflow detection endpoint │
   │ + GSAP animation       │          │ Puter.js chat via WebView   │
   └────────────────────────┘          └──────────────┬──────────────┘
                                                      │
                                          ┌───────────▼───────────┐
                                          │ AsyncStorage          │
                                          │ (stays on the device) │
                                          └───────────────────────┘

   mobile/ar mesh/   standalone MediaPipe Face Mesh browser demo (468 landmarks)
```

There is no backend of my own. Both apps run entirely on the client and call the third-party endpoints directly.

## Tech stack

| | |
|---|---|
| Web | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Three.js, GSAP, `@mediapipe/tasks-vision`, `@mediapipe/face_mesh` |
| Mobile | Expo SDK 54, React Native 0.81, React 19, TypeScript, `expo-camera`, `expo-image-manipulator`, `react-native-webview`, AsyncStorage |
| Standalone demo | MediaPipe Face Mesh loaded from a CDN, plain JavaScript and HTML |

## Running it

```bash
# Web
cd web && npm install && npm run dev

# Mobile
cd mobile && npm install && npx expo start
```

The mobile check-in screen needs your own Roboflow key in a local `.env` file as `EXPO_PUBLIC_ROBOFLOW_API_KEY`. No key is committed to this repository.

## Status

Working prototype, paused pre-launch. It has never been released or published to an app store, and it has no users. Several screens use placeholder data rather than live models, as noted above.

Built independently with AI-assisted development (Claude Code).

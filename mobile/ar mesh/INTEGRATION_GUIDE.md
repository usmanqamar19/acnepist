# Integration Guide - Face Mesh Detection

This guide explains how to integrate the face mesh detection into your existing project.

## Files You Need

Copy these files to your project:
- `app.js` - Main JavaScript logic
- `style.css` - Styling (optional, customize as needed)

## Required Dependencies

The app uses MediaPipe via CDN. You need to include these scripts in your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" crossorigin="anonymous"></script>
```

## HTML Structure Required

Your HTML needs these elements with these specific IDs:

```html
<video id="video" autoplay playsinline></video>
<canvas id="output"></canvas>
<button id="startBtn">Start Detection</button>
<button id="stopBtn" disabled>Stop Detection</button>
```

## Integration Methods

### Method 1: Vanilla JavaScript (Simple Integration)

1. **Add the HTML structure** to your page:
```html
<div class="face-mesh-container">
    <video id="video" autoplay playsinline></video>
    <canvas id="output"></canvas>
    <button id="startBtn">Start Detection</button>
    <button id="stopBtn" disabled>Stop Detection</button>
</div>
```

2. **Include MediaPipe scripts** before your app.js:
```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
<script src="app.js"></script>
```

3. **Copy `app.js`** to your project and include it.

4. **Copy `style.css`** (optional) or add your own styles.

### Method 2: As a Module/Class (Better for Integration)

If you want to use it as a reusable component, wrap it in a class:

```javascript
// faceMeshDetector.js
class FaceMeshDetector {
    constructor(videoId, canvasId, startBtnId, stopBtnId) {
        this.videoElement = document.getElementById(videoId);
        this.canvasElement = document.getElementById(canvasId);
        this.canvasCtx = this.canvasElement.getContext('2d');
        this.startBtn = document.getElementById(startBtnId);
        this.stopBtn = document.getElementById(stopBtnId);
        
        this.camera = null;
        this.faceMesh = null;
        this.faceDetectionStartTime = null;
        this.lastLandmarks = null;
        this.sortedLandmarkIndices = null;
        
        // Animation settings
        this.DOT_APPEAR_DURATION = 800;
        this.LINE_APPEAR_DURATION = 1000;
        this.WHITE_OPACITY = 'rgba(255, 255, 255, 0.7)';
        
        this.init();
    }
    
    init() {
        // Wait for MediaPipe to load
        this.waitForMediaPipe();
        this.startBtn.addEventListener('click', () => this.startDetection());
        this.stopBtn.addEventListener('click', () => this.stopDetection());
    }
    
    waitForMediaPipe() {
        if (typeof FaceMesh !== 'undefined' && typeof Camera !== 'undefined') {
            this.initializeFaceMesh();
        } else {
            setTimeout(() => this.waitForMediaPipe(), 100);
        }
    }
    
    initializeFaceMesh() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });
        
        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        this.faceMesh.onResults((results) => this.onResults(results));
    }
    
    // ... (copy rest of the functions from app.js, converting them to methods)
}

// Usage:
// const detector = new FaceMeshDetector('video', 'output', 'startBtn', 'stopBtn');
```

### Method 3: React Integration

1. **Install MediaPipe packages** (optional, or use CDN):
```bash
npm install @mediapipe/face_mesh @mediapipe/camera_utils @mediapipe/drawing_utils
```

2. **Create a React component**:

```jsx
import React, { useRef, useEffect, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_FACE_OVAL, FACEMESH_LIPS } from '@mediapipe/face_mesh';

const FaceMeshDetector = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const cameraRef = useRef(null);
    const faceMeshRef = useRef(null);
    
    useEffect(() => {
        // Initialize FaceMesh
        faceMeshRef.current = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });
        
        faceMeshRef.current.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        faceMeshRef.current.onResults(onResults);
        
        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
        };
    }, []);
    
    const onResults = (results) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Copy the logic from app.js onResults function here
        // ... (same drawing logic)
    };
    
    const startDetection = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            
            videoRef.current.srcObject = stream;
            
            videoRef.current.addEventListener('loadedmetadata', () => {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
            });
            
            cameraRef.current = new Camera(videoRef.current, {
                onFrame: async () => {
                    await faceMeshRef.current.send({ image: videoRef.current });
                },
                width: 640,
                height: 480
            });
            
            cameraRef.current.start();
            setIsRunning(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };
    
    const stopDetection = () => {
        if (cameraRef.current) {
            cameraRef.current.stop();
            cameraRef.current = null;
        }
        
        if (videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        
        setIsRunning(false);
    };
    
    return (
        <div>
            <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />
            <canvas ref={canvasRef} style={{ transform: 'scaleX(-1)' }} />
            <button onClick={startDetection} disabled={isRunning}>Start</button>
            <button onClick={stopDetection} disabled={!isRunning}>Stop</button>
        </div>
    );
};

export default FaceMeshDetector;
```

### Method 4: Vue.js Integration

Similar to React, create a Vue component:

```vue
<template>
    <div>
        <video ref="video" autoplay playsinline style="display: none;"></video>
        <canvas ref="canvas"></canvas>
        <button @click="startDetection" :disabled="isRunning">Start</button>
        <button @click="stopDetection" :disabled="!isRunning">Stop</button>
    </div>
</template>

<script>
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
// ... other imports

export default {
    data() {
        return {
            isRunning: false,
            camera: null,
            faceMesh: null
        };
    },
    mounted() {
        this.initializeFaceMesh();
    },
    methods: {
        initializeFaceMesh() {
            // Copy initialization logic from app.js
        },
        startDetection() {
            // Copy start logic
        },
        stopDetection() {
            // Copy stop logic
        }
    }
};
</script>
```

## Key Points to Remember

1. **Element IDs**: The code expects specific IDs (`video`, `output`, `startBtn`, `stopBtn`). Either use these IDs or modify the code to accept different selectors.

2. **MediaPipe Loading**: MediaPipe scripts must load before your app.js runs. Use the `waitForMediaPipe()` function or ensure scripts load in order.

3. **Camera Permissions**: The app requires camera access. Make sure your site is served over HTTPS (or localhost) for camera access to work.

4. **Canvas Sizing**: The canvas should match the video dimensions. The code handles this automatically, but ensure both elements are properly sized.

5. **Styling**: The video and canvas are overlaid. The canvas draws on top of the video. You may need to adjust CSS for proper positioning.

## Customization

### Change Animation Speed
Modify these constants in `app.js`:
```javascript
const DOT_APPEAR_DURATION = 800; // milliseconds
const LINE_APPEAR_DURATION = 1000; // milliseconds
```

### Change Colors
Modify the opacity/color:
```javascript
const WHITE_OPACITY = 'rgba(255, 255, 255, 0.7)'; // White with 70% opacity
```

### Change Element IDs
If you want different IDs, modify the first lines of `app.js`:
```javascript
const videoElement = document.getElementById('your-video-id');
const canvasElement = document.getElementById('your-canvas-id');
// etc.
```

## Troubleshooting

- **MediaPipe not loading**: Ensure all script tags are included and loaded before app.js
- **Camera not working**: Check browser permissions and ensure HTTPS/localhost
- **Canvas not showing**: Check that canvas dimensions match video dimensions
- **No face detected**: Ensure good lighting and face is clearly visible

## Example: Minimal Integration

Here's the minimal code needed:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My App with Face Mesh</title>
</head>
<body>
    <!-- Your existing content -->
    
    <!-- Face Mesh Elements -->
    <video id="video" autoplay playsinline style="display: none;"></video>
    <canvas id="output"></canvas>
    <button id="startBtn">Start Face Detection</button>
    <button id="stopBtn" disabled>Stop</button>
    
    <!-- MediaPipe Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
    
    <!-- Your app.js -->
    <script src="app.js"></script>
</body>
</html>
```

That's it! The face mesh detection will work with your existing project.



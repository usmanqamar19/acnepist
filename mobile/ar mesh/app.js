const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let camera = null;
let faceMesh = null;
let faceDetectionStartTime = null;

let lastLandmarks = null;
let sortedLandmarkIndices = null; // Store indices sorted by distance from center

// Animation settings
const DOT_APPEAR_DURATION = 800; // 0.8 seconds for dots to appear
const LINE_APPEAR_DURATION = 1000; // 1 second for lines to appear after dots
const WHITE_OPACITY = 'rgba(255, 255, 255, 0.7)'; // White with 70% opacity

// Wait for MediaPipe to load
function waitForMediaPipe() {
    if (typeof FaceMesh !== 'undefined' && typeof Camera !== 'undefined') {
        initializeFaceMesh();
    } else {
        setTimeout(waitForMediaPipe, 100);
    }
}

// Initialize MediaPipe Face Mesh
function initializeFaceMesh() {
    faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);
}

// Handle face mesh results
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        // Reset timer if landmarks changed significantly (new face detected)
        if (lastLandmarks === null || hasSignificantChange(landmarks, lastLandmarks)) {
            faceDetectionStartTime = Date.now();
            // Calculate center of face and sort landmarks by distance from center (edges first)
            sortedLandmarkIndices = sortLandmarksByDistanceFromCenter(landmarks);
        }
        lastLandmarks = landmarks;

        const currentTime = Date.now();
        const elapsed = currentTime - faceDetectionStartTime;

        // Calculate animation progress
        const dotProgress = Math.min(elapsed / DOT_APPEAR_DURATION, 1);
        // Lines only appear after all dots are done
        const lineProgress = dotProgress >= 1 ? Math.min((elapsed - DOT_APPEAR_DURATION) / LINE_APPEAR_DURATION, 1) : 0;

        // Draw dots first (they appear from edges to center)
        const numDots = landmarks.length;
        const dotsToShow = Math.floor(numDots * dotProgress);
        
        // Create a set of visible landmark indices for line drawing
        const visibleLandmarks = new Set();
        
        for (let i = 0; i < dotsToShow; i++) {
            const landmarkIndex = sortedLandmarkIndices[i];
            visibleLandmarks.add(landmarkIndex);
            const landmark = landmarks[landmarkIndex];
            const x = landmark.x * canvasElement.width;
            const y = landmark.y * canvasElement.height;
            
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 2, 0, 2 * Math.PI);
            canvasCtx.fillStyle = WHITE_OPACITY;
            canvasCtx.fill();
        }

        // Draw lines after all dots are visible (they connect slowly)
        if (lineProgress > 0 && dotProgress >= 1) {
            // Combine all connection types
            const allConnections = [
                ...FACEMESH_TESSELATION,
                ...FACEMESH_FACE_OVAL,
                ...FACEMESH_RIGHT_EYE,
                ...FACEMESH_LEFT_EYE,
                ...FACEMESH_LIPS
            ];

            const totalConnections = allConnections.length;
            const connectionsToShow = Math.floor(totalConnections * lineProgress);

            canvasCtx.strokeStyle = WHITE_OPACITY;
            canvasCtx.lineWidth = 1.5;
            canvasCtx.lineCap = 'round';
            canvasCtx.lineJoin = 'round';

            for (let i = 0; i < connectionsToShow; i++) {
                const connection = allConnections[i];
                const start = landmarks[connection[0]];
                const end = landmarks[connection[1]];

                // Only draw if both endpoints have dots visible
                if (visibleLandmarks.has(connection[0]) && visibleLandmarks.has(connection[1])) {
                    canvasCtx.beginPath();
                    canvasCtx.moveTo(
                        start.x * canvasElement.width,
                        start.y * canvasElement.height
                    );
                    canvasCtx.lineTo(
                        end.x * canvasElement.width,
                        end.y * canvasElement.height
                    );
                    canvasCtx.stroke();
                }
            }
        }
    } else {
        // Reset when no face detected
        faceDetectionStartTime = null;
        lastLandmarks = null;
        sortedLandmarkIndices = null;
    }

    canvasCtx.restore();
}

// Sort landmarks by distance from center (edges first, center last)
function sortLandmarksByDistanceFromCenter(landmarks) {
    // Calculate center of face (average of all landmarks)
    let centerX = 0;
    let centerY = 0;
    for (const landmark of landmarks) {
        centerX += landmark.x;
        centerY += landmark.y;
    }
    centerX /= landmarks.length;
    centerY /= landmarks.length;

    // Create array of indices with their distances from center
    const indicesWithDistances = landmarks.map((landmark, index) => {
        const dx = landmark.x - centerX;
        const dy = landmark.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return { index, distance };
    });

    // Sort by distance (furthest first = edges first)
    indicesWithDistances.sort((a, b) => b.distance - a.distance);

    // Return just the indices in sorted order
    return indicesWithDistances.map(item => item.index);
}

// Check if landmarks have changed significantly (new face detected)
function hasSignificantChange(landmarks1, landmarks2) {
    if (!landmarks1 || !landmarks2 || landmarks1.length !== landmarks2.length) {
        return true;
    }
    
    let totalDiff = 0;
    for (let i = 0; i < Math.min(landmarks1.length, landmarks2.length); i++) {
        const dx = landmarks1[i].x - landmarks2[i].x;
        const dy = landmarks1[i].y - landmarks2[i].y;
        totalDiff += Math.sqrt(dx * dx + dy * dy);
    }
    
    // If average change is significant, treat as new face
    return (totalDiff / landmarks1.length) > 0.1;
}

// Start face detection
async function startDetection() {
    try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                width: 640, 
                height: 480,
                facingMode: 'user'
            }
        });

        videoElement.srcObject = stream;
        
        // Wait for video to be ready
        const onLoadedMetadata = () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
        videoElement.addEventListener('loadedmetadata', onLoadedMetadata);

        // Initialize camera
        camera = new Camera(videoElement, {
            onFrame: async () => {
                await faceMesh.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });

        camera.start();
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Error accessing camera. Please make sure you grant camera permissions.');
    }
}

// Stop face detection
function stopDetection() {
    if (camera) {
        camera.stop();
        camera = null;
    }

    if (videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
    }

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Reset animation state
    faceDetectionStartTime = null;
    lastLandmarks = null;
    sortedLandmarkIndices = null;
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Event listeners
startBtn.addEventListener('click', startDetection);
stopBtn.addEventListener('click', stopDetection);

// Initialize when page loads
window.addEventListener('load', waitForMediaPipe);

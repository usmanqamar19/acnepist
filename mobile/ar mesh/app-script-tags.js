// Alternative version using script tags (uncomment in HTML if ES modules don't work)
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let camera = null;
let faceMesh = null;

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

    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            // Draw face mesh tesselation (the main mesh)
            drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
                color: '#C0C0C070',
                lineWidth: 1
            });

            // Draw face oval
            drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
                color: '#FF3030',
                lineWidth: 2
            });

            // Draw right eye
            drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
                color: '#FF3030',
                lineWidth: 2
            });

            // Draw left eye
            drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
                color: '#30FF30',
                lineWidth: 2
            });

            // Draw lips
            drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {
                color: '#00FFFF',
                lineWidth: 2
            });

            // Draw all landmarks as small circles
            drawLandmarks(canvasCtx, landmarks, {
                color: '#C0C0C070',
                radius: 1
            });
        }
    }

    canvasCtx.restore();
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
        videoElement.addEventListener('loadedmetadata', () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
        });

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
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Event listeners
startBtn.addEventListener('click', startDetection);
stopBtn.addEventListener('click', stopDetection);

// Initialize when page loads
window.addEventListener('load', waitForMediaPipe);



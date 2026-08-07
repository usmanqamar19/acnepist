/**
 * Face Mesh Detector Module
 * A reusable module for face mesh detection using MediaPipe
 * 
 * Usage:
 *   const detector = new FaceMeshDetector({
 *     videoId: 'video',
 *     canvasId: 'output',
 *     startBtnId: 'startBtn',
 *     stopBtnId: 'stopBtn'
 *   });
 */

class FaceMeshDetector {
    constructor(options = {}) {
        // Default element IDs
        this.videoId = options.videoId || 'video';
        this.canvasId = options.canvasId || 'output';
        this.startBtnId = options.startBtnId || 'startBtn';
        this.stopBtnId = options.stopBtnId || 'stopBtn';
        
        // Animation settings (customizable)
        this.DOT_APPEAR_DURATION = options.dotAppearDuration || 800;
        this.LINE_APPEAR_DURATION = options.lineAppearDuration || 1000;
        this.WHITE_OPACITY = options.color || 'rgba(255, 255, 255, 0.7)';
        
        // Get elements
        this.videoElement = document.getElementById(this.videoId);
        this.canvasElement = document.getElementById(this.canvasId);
        this.canvasCtx = this.canvasElement.getContext('2d');
        this.startBtn = document.getElementById(this.startBtnId);
        this.stopBtn = document.getElementById(this.stopBtnId);
        
        // State
        this.camera = null;
        this.faceMesh = null;
        this.faceDetectionStartTime = null;
        this.lastLandmarks = null;
        this.sortedLandmarkIndices = null;
        
        // Callbacks
        this.onFaceDetected = options.onFaceDetected || null;
        this.onFaceLost = options.onFaceLost || null;
        
        // Initialize
        this.init();
    }
    
    init() {
        if (!this.videoElement || !this.canvasElement) {
            console.error('FaceMeshDetector: Video or canvas element not found');
            return;
        }
        
        // Wait for MediaPipe to load
        this.waitForMediaPipe();
        
        // Set up event listeners
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.startDetection());
        }
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stopDetection());
        }
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
    
    onResults(results) {
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            
            // Reset timer if landmarks changed significantly (new face detected)
            if (this.lastLandmarks === null || this.hasSignificantChange(landmarks, this.lastLandmarks)) {
                this.faceDetectionStartTime = Date.now();
                this.sortedLandmarkIndices = this.sortLandmarksByDistanceFromCenter(landmarks);
                if (this.onFaceDetected) this.onFaceDetected(landmarks);
            }
            this.lastLandmarks = landmarks;
            
            const currentTime = Date.now();
            const elapsed = currentTime - this.faceDetectionStartTime;
            
            // Calculate animation progress
            const dotProgress = Math.min(elapsed / this.DOT_APPEAR_DURATION, 1);
            const lineProgress = dotProgress >= 1 ? Math.min((elapsed - this.DOT_APPEAR_DURATION) / this.LINE_APPEAR_DURATION, 1) : 0;
            
            // Draw dots first (they appear from edges to center)
            const numDots = landmarks.length;
            const dotsToShow = Math.floor(numDots * dotProgress);
            
            // Create a set of visible landmark indices for line drawing
            const visibleLandmarks = new Set();
            
            for (let i = 0; i < dotsToShow; i++) {
                const landmarkIndex = this.sortedLandmarkIndices[i];
                visibleLandmarks.add(landmarkIndex);
                const landmark = landmarks[landmarkIndex];
                const x = landmark.x * this.canvasElement.width;
                const y = landmark.y * this.canvasElement.height;
                
                this.canvasCtx.beginPath();
                this.canvasCtx.arc(x, y, 2, 0, 2 * Math.PI);
                this.canvasCtx.fillStyle = this.WHITE_OPACITY;
                this.canvasCtx.fill();
            }
            
            // Draw lines after all dots are visible (they connect slowly)
            if (lineProgress > 0 && dotProgress >= 1) {
                const allConnections = [
                    ...FACEMESH_TESSELATION,
                    ...FACEMESH_FACE_OVAL,
                    ...FACEMESH_RIGHT_EYE,
                    ...FACEMESH_LEFT_EYE,
                    ...FACEMESH_LIPS
                ];
                
                const totalConnections = allConnections.length;
                const connectionsToShow = Math.floor(totalConnections * lineProgress);
                
                this.canvasCtx.strokeStyle = this.WHITE_OPACITY;
                this.canvasCtx.lineWidth = 1.5;
                this.canvasCtx.lineCap = 'round';
                this.canvasCtx.lineJoin = 'round';
                
                for (let i = 0; i < connectionsToShow; i++) {
                    const connection = allConnections[i];
                    const start = landmarks[connection[0]];
                    const end = landmarks[connection[1]];
                    
                    // Only draw if both endpoints have dots visible
                    if (visibleLandmarks.has(connection[0]) && visibleLandmarks.has(connection[1])) {
                        this.canvasCtx.beginPath();
                        this.canvasCtx.moveTo(
                            start.x * this.canvasElement.width,
                            start.y * this.canvasElement.height
                        );
                        this.canvasCtx.lineTo(
                            end.x * this.canvasElement.width,
                            end.y * this.canvasElement.height
                        );
                        this.canvasCtx.stroke();
                    }
                }
            }
        } else {
            // Reset when no face detected
            if (this.lastLandmarks !== null && this.onFaceLost) {
                this.onFaceLost();
            }
            this.faceDetectionStartTime = null;
            this.lastLandmarks = null;
            this.sortedLandmarkIndices = null;
        }
        
        this.canvasCtx.restore();
    }
    
    sortLandmarksByDistanceFromCenter(landmarks) {
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
    
    hasSignificantChange(landmarks1, landmarks2) {
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
    
    async startDetection() {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                }
            });
            
            this.videoElement.srcObject = stream;
            
            // Wait for video to be ready
            const onLoadedMetadata = () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
                this.videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
            };
            this.videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
            
            // Initialize camera
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    await this.faceMesh.send({ image: this.videoElement });
                },
                width: 640,
                height: 480
            });
            
            this.camera.start();
            
            if (this.startBtn) this.startBtn.disabled = true;
            if (this.stopBtn) this.stopBtn.disabled = false;
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Error accessing camera. Please make sure you grant camera permissions.');
        }
    }
    
    stopDetection() {
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }
        
        if (this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
        
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Reset animation state
        this.faceDetectionStartTime = null;
        this.lastLandmarks = null;
        this.sortedLandmarkIndices = null;
        
        if (this.startBtn) this.startBtn.disabled = false;
        if (this.stopBtn) this.stopBtn.disabled = true;
    }
    
    // Public method to update settings
    updateSettings(settings) {
        if (settings.dotAppearDuration !== undefined) {
            this.DOT_APPEAR_DURATION = settings.dotAppearDuration;
        }
        if (settings.lineAppearDuration !== undefined) {
            this.LINE_APPEAR_DURATION = settings.lineAppearDuration;
        }
        if (settings.color !== undefined) {
            this.WHITE_OPACITY = settings.color;
        }
    }
    
    // Cleanup method
    destroy() {
        this.stopDetection();
        if (this.startBtn) {
            this.startBtn.removeEventListener('click', this.startDetection);
        }
        if (this.stopBtn) {
            this.stopBtn.removeEventListener('click', this.stopDetection);
        }
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FaceMeshDetector;
}



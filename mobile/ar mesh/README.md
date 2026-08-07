# Face Mesh Detection Web App

A real-time face detection web application using MediaPipe Face Mesh that tracks faces and displays a 3D mesh overlay.

## Features

- Real-time face detection and tracking
- 468 3D face landmarks visualization
- Face mesh overlay with colored connections
- Eye, lip, and face contour highlighting
- Modern, responsive UI

## How to Use

### Option 1: Using a Local Server (Recommended)

1. **Install dependencies** (optional, for npm packages):
   ```bash
   npm install
   ```

2. **Start a local server**:
   ```bash
   npm start
   ```
   Or use any HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (with http-server)
   npx http-server -p 8000
   ```

3. **Open in browser**: Navigate to `http://localhost:8000` in your browser

### Option 2: Direct File Opening

**Note**: Some browsers may block camera access when opening files directly. Using a local server is recommended.

1. **Open the application**: Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)

2. **Grant camera permissions**: When prompted, allow the browser to access your camera

3. **Start detection**: Click the "Start Detection" button to begin face tracking

4. **View the mesh**: The face mesh will appear over your face in real-time with:
   - Gray mesh lines showing the full face structure
   - Red lines for face oval and right eye
   - Green lines for left eye
   - Cyan lines for lips
   - Small dots representing all 468 landmarks

5. **Stop detection**: Click "Stop Detection" to stop the camera and face tracking

## Requirements

- Modern web browser with camera access
- Internet connection (for loading MediaPipe from CDN)
- Webcam or front-facing camera

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Technical Details

- Uses MediaPipe Face Mesh for face detection
- Processes video frames in real-time
- Displays 468 3D face landmarks
- Canvas-based rendering for smooth performance

## Notes

- The app requires HTTPS or localhost to access the camera (for security reasons)
- For local testing, you can use a simple HTTP server:
  ```bash
  # Python 3
  python -m http.server 8000
  
  # Node.js (with http-server)
  npx http-server
  
  # Then open http://localhost:8000 in your browser
  ```


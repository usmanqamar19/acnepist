'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Camera } from '@mediapipe/camera_utils';
import { gsap } from 'gsap';

interface FaceTracking3DProps {
  onBack?: () => void;
}

export default function FaceTracking3D({ onBack }: FaceTracking3DProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const cameraUtilsRef = useRef<Camera | null>(null);
  
  const [isDetected, setIsDetected] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasAnimatedRef = useRef(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera (matching video aspect ratio)
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      canvas: document.createElement('canvas')
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Initialize MediaPipe Face Landmarker (modern API)
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'GPU'
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceLandmarkerRef.current = faceLandmarker;

        // Start camera
        if (videoRef.current) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (faceLandmarkerRef.current && videoRef.current) {
                const results = faceLandmarkerRef.current.detectForVideo(
                  videoRef.current,
                  performance.now()
                );
                updateFaceMesh(results);
              }
            },
            width: 640,
            height: 480
          });
          camera.start();
          cameraUtilsRef.current = camera;
        }
      } catch (error) {
        console.error('Error initializing Face Landmarker:', error);
      }
    };

    initializeFaceLandmarker();

    return () => {
      if (cameraUtilsRef.current) {
        cameraUtilsRef.current.stop();
      }
    };
  }, []);

  // Update face mesh with 3D landmarks
  const updateFaceMesh = (results: any) => {
    if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
      setIsDetected(false);
      if (pointsRef.current) pointsRef.current.visible = false;
      if (linesRef.current) linesRef.current.visible = false;
      return;
    }

    const landmarks = results.faceLandmarks[0];
    setIsDetected(true);

    // Start GSAP animation on first detection
    if (!hasAnimatedRef.current && !isAnimating) {
      hasAnimatedRef.current = true;
      setIsAnimating(true);
      startAnimationSequence();
    }

    if (!sceneRef.current) return;

    // Create geometry from 3D landmarks
    // MediaPipe returns normalized coordinates (0-1) with x, y, z
    const positions = new Float32Array(landmarks.length * 3);
    landmarks.forEach((landmark: any, i: number) => {
      // Convert normalized coordinates to Three.js world space
      // Scale and center around origin, flip Y for Three.js coordinate system
      positions[i * 3] = (landmark.x - 0.5) * 8; // X: -4 to 4
      positions[i * 3 + 1] = -(landmark.y - 0.5) * 8; // Y: -4 to 4 (flipped)
      positions[i * 3 + 2] = (landmark.z || 0) * 5; // Z depth
    });

    // Update or create Points (dots)
    if (!pointsRef.current) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.PointsMaterial({
        color: 0x00ffff, // Cyan color for futuristic look
        size: 0.1,
        transparent: true,
        opacity: 0
      });
      
      const points = new THREE.Points(geometry, material);
      sceneRef.current.add(points);
      pointsRef.current = points;
    } else {
      const geometry = pointsRef.current.geometry;
      const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      positionAttribute.array = positions;
      positionAttribute.needsUpdate = true;
      pointsRef.current.visible = true;
    }

    // Update or create LineSegments (mesh) using MediaPipe tessellation
    if (!linesRef.current) {
      // MediaPipe FaceMesh has 468 landmarks with tessellation
      // Using key facial feature connections for the mesh
      const indices: number[] = [];
      
      // Face outline (jawline) - indices 0-16
      for (let i = 0; i < 16; i++) {
        indices.push(i, (i + 1) % 17);
      }
      
      // Right eyebrow - indices 17-21
      for (let i = 17; i < 21; i++) {
        indices.push(i, i + 1);
      }
      
      // Left eyebrow - indices 22-26
      for (let i = 22; i < 26; i++) {
        indices.push(i, i + 1);
      }
      
      // Nose bridge - indices 27-30
      for (let i = 27; i < 30; i++) {
        indices.push(i, i + 1);
      }
      
      // Nose tip - indices 30-35
      for (let i = 30; i < 35; i++) {
        indices.push(i, (i + 1) % 5 + 30);
      }
      
      // Right eye outline - indices 33-42
      const rightEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
      for (let i = 0; i < rightEyeIndices.length; i++) {
        indices.push(rightEyeIndices[i], rightEyeIndices[(i + 1) % rightEyeIndices.length]);
      }
      
      // Left eye outline - indices 263-362
      const leftEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
      for (let i = 0; i < leftEyeIndices.length; i++) {
        indices.push(leftEyeIndices[i], leftEyeIndices[(i + 1) % leftEyeIndices.length]);
      }
      
      // Mouth outer - indices 61-84
      const mouthOuter = [61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318];
      for (let i = 0; i < mouthOuter.length; i++) {
        indices.push(mouthOuter[i], mouthOuter[(i + 1) % mouthOuter.length]);
      }
      
      // Mouth inner - indices 78-95
      const mouthInner = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324];
      for (let i = 0; i < mouthInner.length; i++) {
        indices.push(mouthInner[i], mouthInner[(i + 1) % mouthInner.length]);
      }
      
      // Add more connections for a fuller mesh
      // Connect key points across face
      const keyConnections = [
        [10, 151], [151, 9], [9, 10], // Forehead
        [168, 8], [8, 6], [6, 197], // Cheek connections
        [234, 227], [227, 116], [116, 117], // Side face
      ];
      keyConnections.forEach(conn => {
        for (let i = 0; i < conn.length - 1; i++) {
          indices.push(conn[i], conn[i + 1]);
        }
      });

      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      lineGeometry.setIndex(indices);
      
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff, // Cyan color
        transparent: true,
        opacity: 0
      });
      
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      sceneRef.current.add(lines);
      linesRef.current = lines;
    } else {
      const geometry = linesRef.current.geometry;
      const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      positionAttribute.array = positions;
      positionAttribute.needsUpdate = true;
      linesRef.current.visible = true;
    }
  };

  // GSAP animation sequence for smooth fade-in
  const startAnimationSequence = () => {
    if (!pointsRef.current || !linesRef.current) return;

    const pointsMaterial = pointsRef.current.material as THREE.PointsMaterial;
    const linesMaterial = linesRef.current.material as THREE.LineBasicMaterial;

    // Reset opacities
    pointsMaterial.opacity = 0;
    linesMaterial.opacity = 0;

    // Animate dots: fade in from 0 to 1 over 1 second
    gsap.to(pointsMaterial, {
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      },
      onComplete: () => {
        // After dots animation completes, animate lines
        // Lines fade in from 0 to 1 over 1.5 seconds
        gsap.to(linesMaterial, {
          opacity: 1,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: () => {
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
              rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
          },
          onComplete: () => {
            setIsAnimating(false);
          }
        });
      }
    });
  };

  // Continuous render loop
  useEffect(() => {
    const render = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      requestAnimationFrame(render);
    };

    const animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Three.js overlay */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* Status indicator */}
      <div className="absolute top-4 left-4 z-20 bg-black/50 text-white px-4 py-2 rounded-lg">
        {isDetected ? (
          <span className="text-green-400">✓ Face Detected</span>
        ) : (
          <span className="text-yellow-400">Looking for face...</span>
        )}
      </div>

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 right-4 z-20 bg-black/50 text-white px-4 py-2 rounded-lg hover:bg-black/70 transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
}


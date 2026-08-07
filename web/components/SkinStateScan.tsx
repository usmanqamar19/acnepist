'use client';

import { useState, useRef, useEffect } from 'react';

interface ScanResult {
  clarityScore: number;
  observations: string[];
  descriptiveAnalysis: string;
}

export default function SkinStateScan({ onBack }: { onBack: () => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Request camera permission
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      })
      .catch((err) => {
        console.error('Camera access denied:', err);
        setHasPermission(false);
      });

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simulate AI analysis (in production, this would call a real CV API)
    setTimeout(() => {
      const mockResult = analyzeSkinState(canvas);
      setResult(mockResult);
      setIsScanning(false);
    }, 2000);
  };

  const analyzeSkinState = (canvas: HTMLCanvasElement): ScanResult => {
    // Mock analysis - in production, this would use actual computer vision
    const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simulate analysis based on image characteristics
    const clarityScore = Math.floor(Math.random() * 3) + 7; // 7-10 range
    
    const observations: string[] = [];
    const possibleObservations = [
      'Some surface texture noticed',
      'A few areas of sensitivity',
      'Overall calm appearance',
      'Minor surface congestion',
      'Gentle redness in some areas',
    ];
    
    // Randomly select 2-3 observations
    const numObservations = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < numObservations; i++) {
      const obs = possibleObservations[Math.floor(Math.random() * possibleObservations.length)];
      if (!observations.includes(obs)) {
        observations.push(obs);
      }
    }

    const descriptiveAnalysis = generateDescriptiveAnalysis(clarityScore, observations);

    return {
      clarityScore,
      observations,
      descriptiveAnalysis,
    };
  };

  const generateDescriptiveAnalysis = (score: number, obs: string[]): string => {
    if (score >= 9) {
      return "Your skin appears quite calm and balanced today. There's a gentle harmony in the texture, with minimal areas of concern. This is a good day to maintain your current routine.";
    } else if (score >= 8) {
      return "Your skin is showing mostly calm characteristics with a few sensitive areas. These moments are completely normal and part of the natural rhythm of your skin. A little extra gentleness today might help.";
    } else {
      return "I notice your skin is feeling a bit more sensitive than usual. This happens to the best of us, and it's okay. Let's focus on soothing and supporting your skin with extra care today.";
    }
  };

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 text-[#7A9370] hover:text-[#9CAF88] transition-colors"
          >
            ← Back
          </button>
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-[#E8E0D3] text-center">
            <p className="text-[#6B6B6B] mb-4">
              Camera access is needed for the skin state check-in. Please enable camera permissions in your browser settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-[#7A9370] hover:text-[#9CAF88] transition-colors"
        >
          ← Back
        </button>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-[#E8E0D3]">
          <h2 className="text-3xl font-light text-[#7A9370] mb-6 text-center">
            Skin State Check-In
          </h2>

          {!result ? (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-[#E8E0D3] aspect-[3/4]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>Gently analyzing...</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={captureAndAnalyze}
                disabled={isScanning}
                className="w-full bg-gradient-to-r from-[#9CAF88] to-[#B8D4A6] text-white py-4 rounded-2xl font-light text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? 'Analyzing...' : 'Take Check-In'}
              </button>

              <p className="text-sm text-[#6B6B6B] text-center">
                This is a gentle observation, not a medical diagnosis. We're here to support, not diagnose.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-block bg-gradient-to-br from-[#9CAF88] to-[#B8D4A6] rounded-full p-8 mb-4">
                  <div className="text-5xl font-light text-white">
                    {result.clarityScore}/10
                  </div>
                  <div className="text-white/90 text-sm mt-2">Calmness</div>
                </div>
              </div>

              <div className="bg-[#F5F1E8] rounded-2xl p-6">
                <h3 className="text-xl font-light text-[#7A9370] mb-3">What I Notice</h3>
                <ul className="space-y-2 mb-4">
                  {result.observations.map((obs, idx) => (
                    <li key={idx} className="text-[#6B6B6B] flex items-start">
                      <span className="text-[#9CAF88] mr-2">•</span>
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#C4D9E8]/30 rounded-2xl p-6">
                <h3 className="text-xl font-light text-[#7FA3C0] mb-3">Gentle Insight</h3>
                <p className="text-[#6B6B6B] leading-relaxed">{result.descriptiveAnalysis}</p>
              </div>

              <button
                onClick={() => {
                  setResult(null);
                  setIsScanning(false);
                }}
                className="w-full bg-gradient-to-r from-[#A8C5D9] to-[#C4D9E8] text-white py-4 rounded-2xl font-light text-lg hover:shadow-lg transition-all"
              >
                Check In Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


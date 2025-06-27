import React, { useRef, useState } from 'react';
import './App.css';
import EyeTracker from './EyeTracker';
import AlarmSystem from './AlarmSystem';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [eyesOpen, setEyesOpen] = useState(true);
  const [cameraError, setCameraError] = useState<string>('');

  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = () => resolve(true);
        });
        console.log('Camera started successfully');
      }
      setCameraError('');
    } catch (error) {
      setCameraError('Camera access denied. Please allow camera permissions.');
      console.error('Camera error:', error);
    }
  };

  // Start/stop tracking
  const toggleTracking = async () => {
    if (!isTracking) {
      await startCamera();
      // Small delay to ensure camera is fully ready
      setTimeout(() => {
        setIsTracking(true);
      }, 1000);
    } else {
      setIsTracking(false);
    }
  };

  // Handle eye state changes from EyeTracker
  const handleEyeStateChange = (isOpen: boolean) => {
    setEyesOpen(isOpen);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>EyeGuard - Drowsiness Detection</h1>
      </header>
      
      <main className="app-main">
        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width="640"
            height="480"
          />
          <canvas
            ref={canvasRef}
            className="video-overlay"
            width="640"
            height="480"
          />
          {cameraError && (
            <div className="error-message">{cameraError}</div>
          )}
        </div>
        
        <div className="controls">
          <button 
            className={`control-btn ${isTracking ? 'stop' : 'start'}`}
            onClick={toggleTracking}
          >
            {isTracking ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
        
        <div className="status">
          <div className={`status-indicator ${eyesOpen ? 'open' : 'closed'}`}>
            Eyes: {eyesOpen ? 'OPEN' : 'CLOSED'}
          </div>
        </div>

        {/* Eye tracking component */}
        <EyeTracker
          videoRef={videoRef}
          canvasRef={canvasRef}
          isTracking={isTracking}
          onEyeStateChange={handleEyeStateChange}
        />

        {/* Alarm system */}
        <AlarmSystem
          eyesOpen={eyesOpen}
          isTracking={isTracking}
        />
      </main>
    </div>
  );
}

export default App;

import { useRef, useState } from 'react';
import AlarmSystem from './AlarmSystem';
import './App.css';
import EyeTracker from './EyeTracker';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [eyesOpen, setEyesOpen] = useState(true);
  const [cameraError, setCameraError] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [beepDelay, setBeepDelay] = useState(300); // milliseconds
  const [showCrosshair, setShowCrosshair] = useState(true);

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
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          ⚙️
        </button>
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
          showCrosshair={showCrosshair}
        />

        {/* Alarm system */}
        <AlarmSystem
          eyesOpen={eyesOpen}
          isTracking={isTracking}
          beepDelay={beepDelay}
        />
      </main>

      {/* Settings Popup */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-popup" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>Settings</h3>
              <button 
                className="close-btn"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="settings-content">
              <div className="setting-item">
                <label htmlFor="beepDelay">
                  Beep delay: {beepDelay}ms
                </label>
                <input
                  id="beepDelay"
                  type="range"
                  min="250"
                  max="3000"
                  step="250"
                  value={beepDelay}
                  onChange={(e) => setBeepDelay(Number(e.target.value))}
                  className="delay-slider"
                />
                <div className="slider-labels">
                  <span>250ms</span>
                  <span>3s</span>
                </div>
              </div>
              
              <div className="setting-item">
                <label htmlFor="showCrosshair">
                  <input
                    id="showCrosshair"
                    type="checkbox"
                    checked={showCrosshair}
                    onChange={(e) => setShowCrosshair(e.target.checked)}
                  />
                  Show crosshairs
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

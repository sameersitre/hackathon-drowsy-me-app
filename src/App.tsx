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
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isModelReady, setIsModelReady] = useState(false);

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
      if (!isModelReady) {
        console.log('Model is not ready yet, please wait...');
        return;
      }
      
      setLoadingStage("Starting camera...");
      setLoadingProgress(0);
      
      await startCamera();
      
      setLoadingStage("Initializing detection...");
      setLoadingProgress(50);
      
      // Smaller delay to ensure camera is ready but not too long
      setTimeout(() => {
        console.log('Starting tracking with beepDelay:', beepDelay);
        setLoadingStage("Ready!");
        setLoadingProgress(100);
        
        setTimeout(() => {
          setLoadingStage(null);
          setIsTracking(true);
        }, 500);
      }, 100);
    } else {
      setIsTracking(false);
    }
  };

  // Handle eye state changes from EyeTracker
  const handleEyeStateChange = (isOpen: boolean) => {
    console.log(`App: Eye state changed - isOpen=${isOpen}, beepDelay=${beepDelay}`);
    setEyesOpen(isOpen);
  };

  // Handle loading stage changes from EyeTracker
  const handleLoadingStageChange = (stage: string | null, progress: number = 0) => {
    setLoadingStage(stage);
    setLoadingProgress(progress);
    
    if (stage === null && progress === 100) {
      setIsModelReady(true);
    }
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
            className={`control-btn ${isTracking ? 'stop' : 'start'} ${!isModelReady ? 'loading' : ''}`}
            onClick={toggleTracking}
            disabled={!isModelReady}
          >
            {!isModelReady 
              ? 'Loading Model...' 
              : isTracking 
                ? 'Stop Monitoring' 
                : 'Start Monitoring'
            }
          </button>
        </div>
        
        <div className="status">
          <div className={`status-indicator ${eyesOpen ? 'open' : 'closed'}`}>
            Eyes: {eyesOpen ? 'OPEN' : 'CLOSED'}
          </div>
          {!isModelReady && (
            <div className="model-status">
              🔄 Preparing eye detection system...
            </div>
          )}
        </div>

        {/* Eye tracking component */}
        <EyeTracker
          videoRef={videoRef}
          canvasRef={canvasRef}
          isTracking={isTracking}
          onEyeStateChange={handleEyeStateChange}
          showCrosshair={showCrosshair}
          onLoadingStageChange={handleLoadingStageChange}
        />

        {/* Alarm system */}
        <AlarmSystem
          eyesOpen={eyesOpen}
          isTracking={isTracking}
          beepDelay={beepDelay}
        />
      </main>

      {/* Loading Popup */}
      {loadingStage && (
        <div className="loading-popup-overlay">
          <div className="loading-popup">
            <div className="loading-header">
              <h3>🔄 Eye Detection System</h3>
            </div>
            <div className="loading-content">
              <div className="loading-spinner-large"></div>
              <div className="loading-stage-text">{loadingStage}</div>
              <div className="loading-progress-container">
                <div className="loading-progress-bar">
                  <div 
                    className="loading-progress-fill" 
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <div className="loading-percentage">{loadingProgress}%</div>
              </div>
              <div className="loading-details">
                {loadingProgress < 25 && (
                  <p>Initializing machine learning framework...</p>
                )}
                {loadingProgress >= 25 && loadingProgress < 50 && (
                  <p>Downloading face detection model...</p>
                )}
                {loadingProgress >= 50 && loadingProgress < 75 && (
                  <p>Setting up face detector...</p>
                )}
                {loadingProgress >= 75 && loadingProgress < 100 && (
                  <p>Optimizing performance...</p>
                )}
                {loadingProgress === 100 && (
                  <p>✅ System ready!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

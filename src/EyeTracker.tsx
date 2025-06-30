import React, { useRef, useEffect, useCallback, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

interface EyeTrackerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isTracking: boolean;
  onEyeStateChange: (isOpen: boolean) => void;
  showCrosshair: boolean;
  onLoadingStageChange?: (stage: string | null, progress?: number) => void;
}

const EyeTracker: React.FC<EyeTrackerProps> = ({
  videoRef,
  canvasRef,
  isTracking,
  onEyeStateChange,
  showCrosshair,
  onLoadingStageChange,
}) => {
  const detectorRef =
    useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const animationRef = useRef<number>(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Initialize TensorFlow.js and load the model
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Stage 1: Initialize TensorFlow.js
        onLoadingStageChange?.("Initializing TensorFlow.js...", 0);
        await tf.ready();
        console.log("TensorFlow.js backend ready");
        
        // Stage 2: Loading model files
        onLoadingStageChange?.("Loading face detection model...", 25);
        
        // Load the MediaPipe FaceMesh model
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: "tfjs" as const,
          refineLandmarks: true,
        };
        
        // Stage 3: Creating detector
        onLoadingStageChange?.("Creating face detector...", 50);
        
        detectorRef.current = await faceLandmarksDetection.createDetector(
          model,
          detectorConfig
        );
        
        // Stage 4: Warming up model
        onLoadingStageChange?.("Warming up model...", 75);
        
        // Create a dummy canvas to warm up the model
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 640;
        dummyCanvas.height = 480;
        const dummyCtx = dummyCanvas.getContext('2d');
        if (dummyCtx) {
          dummyCtx.fillStyle = 'black';
          dummyCtx.fillRect(0, 0, 640, 480);
          try {
            await detectorRef.current.estimateFaces(dummyCanvas);
          } catch {
            console.log("Model warmup completed with expected error");
          }
        }
        
        // Stage 5: Complete
        onLoadingStageChange?.("Model ready!", 100);
        
        setTimeout(() => {
          console.log("Face detection model loaded successfully");
          setIsModelLoaded(true);
          onLoadingStageChange?.(null, 100);
        }, 500);
        
      } catch (error) {
        console.error("Error loading face detection model:", error);
        onLoadingStageChange?.(null, 0);
        
        // Try a simpler fallback
        try {
          onLoadingStageChange?.("Trying fallback configuration...", 25);
          const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
          const fallbackConfig = {
            runtime: "tfjs" as const,
            refineLandmarks: false,
          };
          
          detectorRef.current = await faceLandmarksDetection.createDetector(
            model,
            fallbackConfig
          );
          
          onLoadingStageChange?.("Fallback model ready!", 100);
          setTimeout(() => {
            setIsModelLoaded(true);
            onLoadingStageChange?.(null, 100);
          }, 500);
          
        } catch (fallbackError) {
          console.error("Fallback model loading failed:", fallbackError);
          onLoadingStageChange?.(null, 0);
        }
      }
    };

    loadModel();
  }, []);

  // Calculate eye aspect ratio (EAR) to determine if eyes are open/closed
  const calculateEAR = (eyeLandmarks: number[][]) => {
    if (eyeLandmarks.length < 6) return 0;
    
    // Calculate vertical distances (top-bottom of eye)
    const v1 = Math.hypot(
      eyeLandmarks[1][0] - eyeLandmarks[5][0],
      eyeLandmarks[1][1] - eyeLandmarks[5][1]
    );
    const v2 = Math.hypot(
      eyeLandmarks[2][0] - eyeLandmarks[4][0],
      eyeLandmarks[2][1] - eyeLandmarks[4][1]
    );
    
    // Calculate horizontal distance (left-right of eye)
    const h = Math.hypot(
      eyeLandmarks[0][0] - eyeLandmarks[3][0],
      eyeLandmarks[0][1] - eyeLandmarks[3][1]
    );
    
    // Eye aspect ratio - if h is 0, return 0 to avoid division by zero
    if (h === 0) return 0;
    return (v1 + v2) / (2 * h);
  };

  // Calculate eye center for crosshair positioning
  const calculateEyeCenter = (eyeLandmarks: number[][]) => {
    if (eyeLandmarks.length < 6) return { x: 0, y: 0 };
    
    const x = eyeLandmarks.reduce((sum, point) => sum + point[0], 0) / eyeLandmarks.length;
    const y = eyeLandmarks.reduce((sum, point) => sum + point[1], 0) / eyeLandmarks.length;
    
    return { x, y };
  };

  // Draw crosshair on canvas
  const drawCrosshair = (ctx: CanvasRenderingContext2D, x: number, y: number, isOpen: boolean) => {
    const size = 30; // Increased size for better visibility
    const color = isOpen ? '#00ff00' : '#ff0000'; // Green for open, red for closed
    
    // Set line style with increased visibility
    ctx.strokeStyle = color;
    ctx.lineWidth = 4; // Thicker lines
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10; // Add glow effect
    
    // Draw crosshair lines
    ctx.beginPath();
    // Horizontal line
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    // Vertical line
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
    
    // Draw center circle with increased size
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI); // Larger circle
    ctx.fillStyle = color;
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw outer ring for better visibility
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.stroke();
  };

  // Clear canvas
  const clearCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
  };

  // Main detection loop
  const detectEyes = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !detectorRef.current || !isTracking || !isModelLoaded) {
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
        animationRef.current = requestAnimationFrame(detectEyes);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Set canvas display size to match video display size
      const videoRect = video.getBoundingClientRect();
      canvas.style.width = `${videoRect.width}px`;
      canvas.style.height = `${videoRect.height}px`;

      // Clear previous drawings
      clearCanvas(ctx, canvas.width, canvas.height);

      // Detect faces
      const faces = await detectorRef.current.estimateFaces(video);
      
      if (faces.length > 0) {
        const face = faces[0];
        const keypoints = face.keypoints;
        
        // Simplified MediaPipe eye landmark indices for better accuracy
        // Using key points: left corner, top-left, top-right, right corner, bottom-right, bottom-left
        const leftEyeIndices = [33, 160, 158, 133, 153, 144]; 
        const rightEyeIndices = [362, 385, 387, 263, 373, 380];
        
        // Check if we have enough keypoints (MediaPipe face mesh has 468 landmarks)
        if (keypoints.length < 400) {
          console.warn('Not enough face landmarks detected:', keypoints.length);
          clearCanvas(ctx, canvas.width, canvas.height);
          animationRef.current = requestAnimationFrame(detectEyes);
          return;
        }
        
        const leftEyeLandmarks = leftEyeIndices.map((i) => [
          keypoints[i]?.x || 0,
          keypoints[i]?.y || 0,
        ]);
        const rightEyeLandmarks = rightEyeIndices.map((i) => [
          keypoints[i]?.x || 0,
          keypoints[i]?.y || 0,
        ]);
        
        // Calculate EAR for both eyes
        const leftEAR = calculateEAR(leftEyeLandmarks);
        const rightEAR = calculateEAR(rightEyeLandmarks);
        const avgEAR = (leftEAR + rightEAR) / 2;
        
        // Fallback: simple vertical distance check if EAR calculation fails
        let eyesOpen = true;
        if (leftEAR > 0 && rightEAR > 0) {
          // Use EAR method
          const EAR_THRESHOLD = 0.15; // More sensitive threshold
          eyesOpen = avgEAR > EAR_THRESHOLD;
        } else {
          // Fallback: check vertical distance between eye corners
          const leftEyeHeight = Math.abs(keypoints[159].y - keypoints[145].y); // top - bottom of left eye
          const rightEyeHeight = Math.abs(keypoints[386].y - keypoints[374].y); // top - bottom of right eye
          const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
          eyesOpen = avgEyeHeight > 3; // pixels threshold
          console.log(`Fallback method: Avg eye height: ${avgEyeHeight.toFixed(1)}px, Eyes open: ${eyesOpen}`);
        }
        
        // Debug logging
        console.log(`Left EAR: ${leftEAR.toFixed(3)}, Right EAR: ${rightEAR.toFixed(3)}, Avg: ${avgEAR.toFixed(3)}, Eyes Open: ${eyesOpen}`);
        
        // Calculate eye centers for crosshairs
        const leftEyeCenter = calculateEyeCenter(leftEyeLandmarks);
        const rightEyeCenter = calculateEyeCenter(rightEyeLandmarks);
        
        // Draw crosshairs on both eyes (if enabled)
        if (showCrosshair) {
          // Apply scaling to match display coordinates - no scaling needed since canvas matches video size
          drawCrosshair(ctx, leftEyeCenter.x, leftEyeCenter.y, eyesOpen);
          drawCrosshair(ctx, rightEyeCenter.x, rightEyeCenter.y, eyesOpen);
        }
        
        onEyeStateChange(eyesOpen);
      } else {
        // No face detected, clear crosshairs
        console.log('No face detected');
        clearCanvas(ctx, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error("Error in eye detection:", error);
    }
    
    // Continue the detection loop
    if (isTracking) {
      animationRef.current = requestAnimationFrame(detectEyes);
    }
  }, [isTracking, onEyeStateChange, showCrosshair, isModelLoaded]);

  // Start/stop detection when tracking state changes
  useEffect(() => {
    if (isTracking && detectorRef.current && isModelLoaded) {
      console.log('Starting eye detection...');
      detectEyes();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      // Clear canvas when stopping
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          clearCanvas(ctx, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTracking, detectEyes, isModelLoaded]);

  return null; // This component doesn't render anything
};

export default EyeTracker;

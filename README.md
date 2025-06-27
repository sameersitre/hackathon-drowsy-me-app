# Eye Tracking Drowsiness Detection App

A simple React web application that monitors your eyes in real-time and plays an alarm when you close your eyes to prevent drowsiness.

## Features ✅

- **Real-time Camera Feed**: Shows your camera on screen
- **Eye Tracking**: Uses TensorFlow.js to detect when your eyes are open/closed
- **Audio Alarm**: Plays a beep sound when eyes are closed, stops when opened
- **Simple Controls**: Start/stop monitoring with one button
- **Visual Status**: Shows current eye state (OPEN/CLOSED)

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Navigate to `http://localhost:5173`
   - Allow camera permissions when prompted

4. **Use the app:**
   - Click "Start Monitoring" to begin eye tracking
   - The app will show your camera feed and track your eyes
   - When you close your eyes, an alarm will sound
   - When you open your eyes, the alarm stops
   - Click "Stop Monitoring" to end the session

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Device with a front-facing camera
- Microphone/speakers for audio alerts

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **ML**: TensorFlow.js with MediaPipe Face Mesh
- **Audio**: Web Audio API
- **Build Tool**: Vite

## Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- Camera feed never leaves your device

## Troubleshooting

- **Camera not working**: Make sure to allow camera permissions
- **No sound**: Check your browser's audio settings and volume
- **Eye detection not accurate**: Try adjusting lighting or camera position
- **Performance issues**: Close other browser tabs to free up resources

Enjoy staying alert with Drowsy Detector! 👁️

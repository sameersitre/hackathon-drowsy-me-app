# Product Requirements Document (PRD)
## Eye Tracking Drowsiness Detection Web Application

### 1. Executive Summary

**Product Name:** EyeGuard - Real-time Drowsiness Detection System

**Product Vision:** A web-based application that monitors user alertness through real-time eye tracking, providing immediate audio alerts when drowsiness is detected to prevent accidents and maintain focus.

**Target Users:** 
- Drivers (primary)
- Students studying for long hours
- Night shift workers
- Remote workers
- Anyone requiring sustained attention

### 2. Problem Statement

Drowsiness and fatigue are major causes of accidents, reduced productivity, and safety incidents. Current solutions are either expensive, hardware-dependent, or not easily accessible. There's a need for an accessible, web-based solution that can run on any device with a camera.

### 3. Product Goals & Objectives

**Primary Goals:**
- Detect eye closure in real-time with 95%+ accuracy
- Provide immediate audio alerts when drowsiness is detected
- Ensure low latency (<100ms) for safety-critical applications
- Work on standard web browsers without additional software installation

**Success Metrics:**
- Eye detection accuracy: >95%
- False positive rate: <5%
- Response time: <100ms from eye closure detection to alarm
- Browser compatibility: Chrome, Firefox, Safari, Edge
- User engagement: >80% completion rate for initial setup

### 4. Target Audience

**Primary Users:**
- Age: 18-65
- Tech-savvy individuals comfortable with web applications
- Users with devices equipped with front-facing cameras
- People who spend extended periods requiring sustained attention

**Use Cases:**
- Personal productivity monitoring
- Driver alertness systems
- Study session monitoring
- Workplace safety compliance

### 5. Functional Requirements

#### 5.1 Core Features

**Camera Integration:**
- ✅ FR-001: Access user's front-facing camera with permission
- ✅ FR-002: Display live camera feed on screen
- ✅ FR-003: Support common video resolutions (480p, 720p, 1080p)
- ✅ FR-004: Handle camera permission denial gracefully

**Eye Tracking:**
- ✅ FR-005: Detect and track both eyes in real-time using TensorFlow.js
- ✅ FR-006: Calculate eye aspect ratio (EAR) or similar metrics
- ✅ FR-007: Determine eye open/closed state with configurable thresholds
- FR-008: Maintain tracking accuracy in various lighting conditions

**Alert System:**
- ✅ FR-009: Trigger audio alarm when eyes are closed for >1 second
- ✅ FR-010: Stop alarm immediately when eyes reopen
- FR-011: Support different alarm tones/sounds
- FR-012: Adjustable alarm volume
- ✅ FR-013: Visual indicators for eye state (open/closed)

**User Interface:**
- ✅ FR-014: Clean, intuitive React-based interface
- ✅ FR-015: Real-time eye state indicators (with crosshairs!)
- ✅ FR-016: Settings panel for sensitivity adjustment (delay + crosshair toggle)
- FR-017: Calibration wizard for initial setup
- ✅ FR-018: Start/stop monitoring controls

#### 5.2 Advanced Features (Phase 2)

**Analytics & Reporting:**
- FR-019: Track drowsiness events with timestamps
- FR-020: Generate session reports
- FR-021: Export data for analysis

**Customization:**
- FR-022: Adjustable sensitivity settings
- FR-023: Custom alarm sounds upload
- FR-024: Dark/light theme toggle

### 6. Technical Requirements

#### 6.1 Technology Stack

**Frontend:**
- React 18+ with hooks
- TypeScript for type safety
- Modern CSS (CSS Grid/Flexbox)
- Web Audio API for sound generation

**Machine Learning:**
- TensorFlow.js
- MediaPipe Face Mesh or similar face detection model
- Client-side inference (no server required)

**Browser APIs:**
- WebRTC/getUserMedia for camera access
- Web Audio API for alarm sounds
- Performance Observer API for optimization

#### 6.2 Performance Requirements

- TR-001: Initial load time <3 seconds
- TR-002: Frame processing rate: 30 FPS minimum
- TR-003: Memory usage <200MB
- TR-004: CPU usage <30% on average devices
- TR-005: Model inference time <33ms per frame

#### 6.3 Compatibility Requirements

- TR-006: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- TR-007: Desktop and laptop devices with cameras
- TR-008: Minimum screen resolution: 1024x768
- TR-009: Minimum camera resolution: 640x480

### 7. Non-Functional Requirements

#### 7.1 Security & Privacy

- NFR-001: All processing happens client-side (no data transmission)
- NFR-002: Camera feed never leaves user's device
- NFR-003: Clear privacy policy and data handling disclosure
- NFR-004: Secure HTTPS deployment only

#### 7.2 Usability

- NFR-005: Intuitive interface requiring <5 minutes to understand
- NFR-006: Accessible design following WCAG 2.1 guidelines
- NFR-007: Responsive design for various screen sizes
- NFR-008: Error messages in plain language

#### 7.3 Reliability

- NFR-009: 99.9% uptime for web application
- NFR-010: Graceful degradation when camera/ML fails
- NFR-011: Automatic recovery from temporary failures
- NFR-012: Fallback options when TensorFlow.js fails to load

### 8. User Stories

#### Epic 1: Basic Eye Tracking
- **US-001:** As a user, I want to grant camera permission so the app can monitor my eyes
- **US-002:** As a user, I want to see my camera feed so I know the app is working
- **US-003:** As a user, I want the app to detect when my eyes are closed so it can alert me

#### Epic 2: Alert System
- **US-004:** As a user, I want to hear an alarm when I close my eyes so I stay alert
- **US-005:** As a user, I want the alarm to stop when I open my eyes so it's not annoying
- **US-006:** As a user, I want to adjust the alarm volume so it suits my environment

#### Epic 3: Configuration
- **US-007:** As a user, I want to calibrate the sensitivity so it works well for my face
- **US-008:** As a user, I want to start/stop monitoring so I have control over when it's active
- **US-009:** As a user, I want to see visual indicators of my eye state so I understand what's happening

### 9. Technical Architecture

#### 9.1 Component Structure
```
App
├── CameraFeed
├── EyeTracker
├── AlertSystem
├── ControlPanel
├── Settings
└── StatusIndicator
```

#### 9.2 Data Flow
1. Camera captures video frames
2. TensorFlow.js processes frames for face detection
3. Eye landmarks extracted and analyzed
4. Eye state determined (open/closed)
5. Alert system triggered based on state changes
6. UI updated with current status

### 10. Development Phases

#### Phase 1 (MVP - 4 weeks)
- ✅ Basic camera integration
- ✅ TensorFlow.js eye detection
- ✅ Simple alarm system
- ✅ Basic UI controls

#### Phase 2 (Enhanced - 2 weeks)
- Sensitivity adjustment
- Visual improvements
- Better error handling
- Performance optimization

#### Phase 3 (Advanced - 2 weeks)
- Analytics dashboard
- Multiple alarm sounds
- Advanced calibration
- Accessibility improvements

### 11. Success Criteria

**Launch Criteria:**
- Eye detection works with 90%+ accuracy in standard lighting
- Alarm triggers within 1-2 seconds of eye closure
- Supports major browsers (Chrome, Firefox, Safari, Edge)
- No critical bugs in core functionality

**User Acceptance Criteria:**
- Users can set up and start using the app within 5 minutes
- False positive rate below 10%
- Positive user feedback on usability and effectiveness

### 12. Risks & Mitigation

**Technical Risks:**
- **Risk:** TensorFlow.js performance issues on older devices
- **Mitigation:** Performance testing, model optimization, fallback options

- **Risk:** Camera access restrictions in browsers
- **Mitigation:** Clear permission requests, fallback instructions

**User Experience Risks:**
- **Risk:** High false positive rates causing user frustration
- **Mitigation:** Proper calibration system, adjustable sensitivity

- **Risk:** Privacy concerns about camera usage
- **Mitigation:** Clear privacy policy, local processing emphasis

### 13. Future Enhancements

- Mobile device support (iOS/Android browsers)
- Multiple face detection for group monitoring
- Integration with external alerting systems
- Machine learning model fine-tuning based on user feedback
- Sleep pattern analysis and reporting
- Integration with wearable devices

### 14. Appendix

#### 14.1 Glossary
- **EAR (Eye Aspect Ratio):** Mathematical formula to determine eye openness
- **MediaPipe:** Google's framework for multimodal applied ML pipelines
- **WebRTC:** Web Real-Time Communication protocol for media streaming

#### 14.2 References
- TensorFlow.js Documentation
- MediaPipe Face Mesh
- Web Audio API Specification
- WebRTC getUserMedia API 
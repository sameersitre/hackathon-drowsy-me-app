import React, { useRef, useEffect } from 'react';

interface AlarmSystemProps {
  eyesOpen: boolean;
  isTracking: boolean;
  beepDelay: number; // milliseconds before alarm starts
}

const AlarmSystem: React.FC<AlarmSystemProps> = ({ eyesOpen, isTracking, beepDelay }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (error) {
      console.error('Web Audio API not supported:', error);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Create and start beep sound
  const startBeep = () => {
    if (!audioContextRef.current || isPlayingRef.current) return;

    try {
      // Create oscillator for beep sound
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();

      // Configure beep (frequency and volume)
      oscillatorRef.current.frequency.setValueAtTime(800, audioContextRef.current.currentTime); // 800Hz beep
      gainNodeRef.current.gain.setValueAtTime(0.3, audioContextRef.current.currentTime); // 30% volume

      // Connect nodes
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Start the beep
      oscillatorRef.current.start();
      isPlayingRef.current = true;

      console.log('Alarm started - Eyes closed detected');
    } catch (error) {
      console.error('Error starting beep:', error);
    }
  };

  // Stop beep sound
  const stopBeep = () => {
    if (!oscillatorRef.current || !isPlayingRef.current) return;

    try {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
      gainNodeRef.current = null;
      isPlayingRef.current = false;

      console.log('Alarm stopped - Eyes opened');
    } catch (error) {
      console.error('Error stopping beep:', error);
    }
  };

  // Handle eye state changes
  useEffect(() => {
    console.log(`AlarmSystem: eyesOpen=${eyesOpen}, isTracking=${isTracking}, beepDelay=${beepDelay}`);
    
    if (!isTracking) {
      stopBeep();
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      return;
    }

    if (!eyesOpen) {
      // Eyes closed - start alarm after delay
      if (!delayTimerRef.current) {
        console.log(`Eyes closed - setting alarm timer for ${beepDelay}ms`);
        delayTimerRef.current = setTimeout(() => {
          startBeep();
          delayTimerRef.current = null;
        }, beepDelay);
      }
    } else {
      // Eyes open - clear delay timer and stop alarm
      if (delayTimerRef.current) {
        console.log('Eyes opened - clearing alarm timer');
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      stopBeep();
    }
  }, [eyesOpen, isTracking, beepDelay]);

  return null; // This component doesn't render anything
};

export default AlarmSystem; 
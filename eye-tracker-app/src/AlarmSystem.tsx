import React, { useRef, useEffect } from 'react';

interface AlarmSystemProps {
  eyesOpen: boolean;
  isTracking: boolean;
}

const AlarmSystem: React.FC<AlarmSystemProps> = ({ eyesOpen, isTracking }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);

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
    if (!isTracking) {
      stopBeep();
      return;
    }

    if (!eyesOpen) {
      // Eyes closed - start alarm
      startBeep();
    } else {
      // Eyes open - stop alarm
      stopBeep();
    }
  }, [eyesOpen, isTracking]);

  return null; // This component doesn't render anything
};

export default AlarmSystem; 
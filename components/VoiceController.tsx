
import React, { useEffect, useState, useRef } from 'react';

interface VoiceControllerProps {
  onCommand: (command: string) => void;
  onListeningState: (isListening: boolean) => void;
}

const VoiceController: React.FC<VoiceControllerProps> = ({ onCommand, onListeningState }) => {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        onListeningState(true);
      };

      recognitionRef.current.onend = () => {
        onListeningState(false);
        // Automatically restart listening to keep it always active
        recognitionRef.current.start();
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        console.log('Voice Command Received:', transcript);
        onCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onListeningState(false);
      };

      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    } else {
      console.warn('Speech Recognition not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onCommand, onListeningState]);

  return null; // This component handles logic, no UI
};

export default VoiceController;

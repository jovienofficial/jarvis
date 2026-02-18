
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeMode } from './types';
import CameraView from './components/CameraView';
import GameCanvas from './components/GameCanvas';
import JarvisOrb from './components/JarvisOrb';
import UIOverlay from './components/UIOverlay';
import VoiceController from './components/VoiceController';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'jarvis';
  text: string;
  timestamp: string;
}

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>('default');
  const [accentColor, setAccentColor] = useState('#00f2ff'); // Default cyan
  const [isJumping, setIsJumping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  
  const aiRef = useRef<any>(null);

  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }, []);

  const addMessage = (role: 'user' | 'jarvis', text: string) => {
    const newMessage: Message = {
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setHistory(prev => [...prev.slice(-10), newMessage]);
  };

  const triggerJump = useCallback(() => {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 100);
  }, []);

  const handleCommand = async (command: string) => {
    const cmd = command.toLowerCase();
    addMessage('user', command);
    let feedback = "";

    // Specific logic for color/theme change
    if (cmd.includes('color') || cmd.includes('scheme') || cmd.includes('theme')) {
      try {
        const response = await aiRef.current.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `The user wants to change the UI color scheme. User input: "${command}". 
          Available preset colors: Red (#ff3131), Green (#39ff14), Blue (#00f2ff), Purple (#bc13fe), Gold (#ffd700), Emerald (#50c878).
          If they specified a color, extract it and return ONLY the hex code. 
          If they didn't specify, pick a "cool futuristic" one. 
          Respond with JUST the hex code, no other text.`,
        });
        
        const newColor = response.text?.trim() || '#00f2ff';
        // Validate hex format roughly
        if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
          setAccentColor(newColor);
          feedback = `Neural interface recalibrated to ${newColor}. Aesthetics updated.`;
        } else {
          feedback = "Specified spectrum outside of standard operating parameters.";
        }
      } catch (err) {
        feedback = "Error accessing visual processor. Reverting to default cyan.";
        setAccentColor('#00f2ff');
      }
    } else if (cmd.includes('reset game') || cmd.includes('restart')) {
      setIsResetting(true);
      setTimeout(() => setIsResetting(false), 500);
      feedback = "Game sequence re-initialized.";
    } else {
      try {
        const response = await aiRef.current.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `You are JARVIS, a sophisticated AI. The user just said: "${command}". Respond briefly and professionally in a futuristic AI tone. Keep it under 20 words.`,
        });
        feedback = response.text || "I am processing your input.";
      } catch (err) {
        feedback = "Signal interference. Please repeat the command.";
      }
    }
    addMessage('jarvis', feedback);
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col transition-all duration-700 bg-black`}>
      {/* Background Grid - Tinted with accent color */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: `radial-gradient(circle, ${accentColor} 1px, transparent 1px)`, 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* TOP HALF: GAME */}
      <div className="h-1/2 w-full flex items-center justify-center p-4 border-b relative z-10 overflow-hidden"
           style={{ borderBottomColor: `${accentColor}33` }}>
        <GameCanvas isJumping={isJumping} isResetting={isResetting} theme={theme} accentColor={accentColor} />
      </div>

      {/* BOTTOM HALF: CAMERA */}
      <div className="h-1/2 w-full relative z-10">
        <CameraView onJump={triggerJump} accentColor={accentColor} />
      </div>

      {/* Floating UI Elements */}
      <UIOverlay theme={theme} isListening={isListening} history={history} accentColor={accentColor} />
      
      <JarvisOrb isListening={isListening} theme={theme} accentColor={accentColor} />

      <VoiceController onCommand={handleCommand} onListeningState={setIsListening} />

      {/* Control Instructions */}
      <div className="absolute top-4 left-4 text-xs font-orbitron opacity-50 space-y-1" style={{ color: accentColor }}>
        <p>G-LINK STATUS: ONLINE</p>
        <p>GESTURE: OPEN PALM = JUMP</p>
        <p>VOICE: "CHANGE COLOR TO GREEN"</p>
      </div>
    </div>
  );
};

export default App;

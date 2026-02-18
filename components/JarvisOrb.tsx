
import React from 'react';
import { ThemeMode } from '../types';

interface JarvisOrbProps {
  isListening: boolean;
  theme: ThemeMode;
  accentColor: string;
}

const JarvisOrb: React.FC<JarvisOrbProps> = ({ isListening, theme, accentColor }) => {
  return (
    <div className="fixed bottom-12 right-12 z-50 pointer-events-none">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse" 
             style={{ background: `radial-gradient(circle, ${accentColor}, transparent)` }}></div>
        
        {/* Rotating Rings */}
        <div className="absolute inset-0 border-2 border-dashed rounded-full animate-[spin_8s_linear_infinite]"
             style={{ borderColor: `${accentColor}33` }}></div>
        <div className="absolute inset-2 border rounded-full animate-[spin_5s_linear_infinite_reverse]"
             style={{ borderColor: `${accentColor}4D` }}></div>
        
        {/* Core Orb */}
        <div className={`relative w-12 h-12 rounded-full shadow-lg overflow-hidden transition-transform duration-500 ${
          isListening ? 'scale-125 pulse-animation' : 'animate-bounce'
        }`} style={{ background: `linear-gradient(135deg, ${accentColor}, #000)`, boxShadow: `0 0 20px ${accentColor}66` }}>
          <div className="absolute inset-0 bg-white/20 blur-sm"></div>
        </div>

        {/* Listening Waveform */}
        {isListening && (
          <div className="absolute -bottom-10 flex space-x-1 h-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="w-1 rounded-full animate-[bounce_1s_infinite]" 
                style={{ 
                  backgroundColor: accentColor,
                  animationDelay: `${i * 0.1}s`, 
                  height: `${20 + Math.random() * 80}%` 
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JarvisOrb;

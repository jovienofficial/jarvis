
import React, { useEffect, useRef } from 'react';
import { ThemeMode } from '../types';

interface Message {
  role: 'user' | 'jarvis';
  text: string;
  timestamp: string;
}

interface UIOverlayProps {
  theme: ThemeMode;
  isListening: boolean;
  history: Message[];
  accentColor: string;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ theme, isListening, history, accentColor }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {/* Top Header Panel */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] flex justify-between items-center pointer-events-auto">
        <div className="glass-panel px-6 py-2 rounded-lg border-l-4" style={{ borderLeftColor: accentColor }}>
           <div className="text-[10px] font-orbitron" style={{ color: `${accentColor}99` }}>SYSTEM_IDENT: JARVIS_CORE</div>
           <div className="text-xl font-orbitron font-bold text-white">NEURAL LINK ACTIVE</div>
        </div>

        <div className="flex space-x-4">
           <div className="glass-panel px-4 py-2 rounded-lg text-right">
              <div className="text-[10px] font-orbitron" style={{ color: `${accentColor}99` }}>THEME_PROTOCOL</div>
              <div className="text-xs font-bold text-white uppercase tracking-widest">{theme}</div>
           </div>
        </div>
      </div>

      {/* Transcription Sidebar */}
      <div className="absolute top-24 right-6 bottom-32 w-80 glass-panel rounded-xl flex flex-col p-4 pointer-events-auto overflow-hidden border-r-4"
           style={{ borderRightColor: `${accentColor}4D` }}>
        <div className="text-[10px] font-orbitron mb-4 border-b pb-2 flex justify-between"
             style={{ color: accentColor, borderBottomColor: `${accentColor}33` }}>
          <span>NEURAL_TRANSCRIPTION_LOG</span>
          <span className="animate-pulse">REC_ACTIVE</span>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto space-y-4 pr-2 scrollbar-thin"
          style={{ scrollBehavior: 'smooth' }}
        >
          {history.length === 0 && (
            <div className="h-full flex items-center justify-center opacity-30 italic text-sm text-center px-4">
              Awaiting neural input commands...
            </div>
          )}
          {history.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`text-[8px] font-orbitron mb-1`} style={{ color: msg.role === 'user' ? accentColor : '#a855f7' }}>
                {msg.role.toUpperCase()} @ {msg.timestamp}
              </div>
              <div className={`max-w-[90%] px-3 py-2 rounded-lg text-sm leading-tight border transition-colors duration-500 ${
                msg.role === 'user' 
                  ? 'text-white rounded-tr-none' 
                  : 'bg-purple-500/10 border-purple-500/30 text-white rounded-tl-none'
              }`} style={msg.role === 'user' ? { backgroundColor: `${accentColor}1A`, borderColor: `${accentColor}4D` } : {}}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {isListening && (
          <div className="mt-4 pt-2 border-t" style={{ borderTopColor: `${accentColor}33` }}>
            <div className="flex items-center space-x-2 text-[10px] font-orbitron" style={{ color: accentColor }}>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span>LISTENING_FOR_SPEECH...</span>
            </div>
          </div>
        )}
      </div>

      {/* Corner Decorative Elements */}
      <div className="absolute bottom-6 left-6 pointer-events-none opacity-20">
        <div className="text-[10px] font-orbitron" style={{ color: accentColor }}>
          GRID_COORD: 45.32.11.0
          <br />
          NODE_STATUS: STABLE
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;

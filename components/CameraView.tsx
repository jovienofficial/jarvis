
import React, { useEffect, useRef, useState } from 'react';

interface CameraViewProps {
  onJump: () => void;
  accentColor: string;
}

declare const Hands: any;
declare const Camera: any;

const CameraView: React.FC<CameraViewProps> = ({ onJump, accentColor }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [handState, setHandState] = useState<'IDLE' | 'DETECTED'>('IDLE');
  const jumpCoolDown = useRef(false);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results: any) => {
      const canvasCtx = canvasRef.current?.getContext('2d');
      if (!canvasCtx || !canvasRef.current) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        const isFingersExtended = 
          landmarks[8].y < landmarks[6].y && 
          landmarks[12].y < landmarks[10].y && 
          landmarks[16].y < landmarks[14].y && 
          landmarks[20].y < landmarks[18].y;

        if (isFingersExtended) {
          if (!jumpCoolDown.current) {
            onJump();
            jumpCoolDown.current = true;
            setHandState('DETECTED');
            setTimeout(() => { jumpCoolDown.current = false; }, 300);
          }
        } else {
          setHandState('IDLE');
        }

        // @ts-ignore
        if (window.drawConnectors) {
          // @ts-ignore
          window.drawConnectors(canvasCtx, landmarks, Hands.HAND_CONNECTIONS, {color: accentColor, lineWidth: 4});
          // @ts-ignore
          window.drawLandmarks(canvasCtx, landmarks, {color: '#ffffff', lineWidth: 2, radius: 4});
        }
      } else {
        setHandState('IDLE');
      }
      canvasCtx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({image: videoRef.current!});
      },
      width: 1280,
      height: 720
    });

    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, [onJump, accentColor]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black/20">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-cover grayscale opacity-50" />
      
      {/* HUD Elements */}
      <div className="absolute top-4 left-4 flex flex-col space-y-2">
        <div className="bg-black/60 px-3 py-1 rounded border text-xs font-orbitron" 
             style={{ borderColor: `${accentColor}66`, color: accentColor }}>
          NEURAL_VISUAL_FEED_01
        </div>
        <div className="bg-black/60 px-3 py-1 rounded border text-[10px] font-orbitron"
             style={{ borderColor: `${accentColor}33`, color: `${accentColor}80` }}>
          SCANNING FOR HAND BIOMETRICS...
        </div>
      </div>
      
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full border-2 transition-all duration-300 font-orbitron text-lg flex items-center space-x-4 ${
        handState === 'DETECTED' ? 'text-white' : 'bg-black/60 border-slate-700 text-slate-500'
      }`} style={handState === 'DETECTED' ? { backgroundColor: `${accentColor}66`, borderColor: accentColor } : {}}>
        <div className={`w-3 h-3 rounded-full ${handState === 'DETECTED' ? 'bg-white animate-ping' : 'bg-slate-700'}`}></div>
        <span>{handState === 'DETECTED' ? 'SYSTEM INPUT: JUMP' : 'AWAITING HAND GESTURE'}</span>
      </div>

      {/* Frame Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: `${accentColor}66` }}></div>
        <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: `${accentColor}66` }}></div>
        <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: `${accentColor}66` }}></div>
        <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: `${accentColor}66` }}></div>
      </div>

      {/* Scanning Line */}
      <div className="absolute top-0 left-0 w-full h-0.5 animate-[scan_4s_linear_infinite]" style={{ backgroundColor: `${accentColor}33` }}></div>
    </div>
  );
};

export default CameraView;

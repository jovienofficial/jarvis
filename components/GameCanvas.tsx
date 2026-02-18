
import React, { useEffect, useRef, useState } from 'react';
import { ThemeMode } from '../types';

interface GameCanvasProps {
  isJumping: boolean;
  isResetting: boolean;
  theme: ThemeMode;
  accentColor: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ isJumping, isResetting, theme, accentColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const GRAVITY = 0.65;
  const JUMP_FORCE = -13;
  const PLAYER_SIZE = 40;
  const OBSTACLE_SPEED = 9;
  const SPAWN_RATE = 75;

  const gameRef = useRef({
    playerY: 0,
    playerVelocity: 0,
    obstacles: [] as { x: number, width: number, height: number }[],
    frameCount: 0,
    isRunning: true,
  });

  useEffect(() => {
    if (isResetting) {
      resetGame();
    }
  }, [isResetting]);

  useEffect(() => {
    if (isJumping && !gameOver && gameRef.current.playerY === 0) {
      gameRef.current.playerVelocity = JUMP_FORCE;
    }
  }, [isJumping, gameOver]);

  const resetGame = () => {
    gameRef.current.playerY = 0;
    gameRef.current.playerVelocity = 0;
    gameRef.current.obstacles = [];
    gameRef.current.frameCount = 0;
    setScore(0);
    setGameOver(false);
    gameRef.current.isRunning = true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const update = () => {
      if (!gameRef.current.isRunning) return;

      gameRef.current.playerVelocity += GRAVITY;
      gameRef.current.playerY += gameRef.current.playerVelocity;

      if (gameRef.current.playerY > 0) {
        gameRef.current.playerY = 0;
        gameRef.current.playerVelocity = 0;
      }

      gameRef.current.frameCount++;
      if (gameRef.current.frameCount % SPAWN_RATE === 0) {
        gameRef.current.obstacles.push({
          x: canvas.width,
          width: 30 + Math.random() * 30,
          height: 40 + Math.random() * 60
        });
      }

      gameRef.current.obstacles.forEach((obs) => {
        obs.x -= OBSTACLE_SPEED;
        const playerX = 50;
        const playerY = canvas.height - PLAYER_SIZE + gameRef.current.playerY - 20;
        
        if (
          playerX < obs.x + obs.width &&
          playerX + PLAYER_SIZE > obs.x &&
          playerY + PLAYER_SIZE > canvas.height - obs.height - 20
        ) {
          gameRef.current.isRunning = false;
          setGameOver(true);
        }
      });

      gameRef.current.obstacles = gameRef.current.obstacles.filter(obs => obs.x + obs.width > 0);
      
      if (gameRef.current.isRunning) {
        setScore(s => s + 1);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const secondaryColor = `${accentColor}4D`; // 30% opacity

      // Draw Floor
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 20);
      ctx.lineTo(canvas.width, canvas.height - 20);
      ctx.stroke();

      // Draw Player
      const pY = canvas.height - PLAYER_SIZE + gameRef.current.playerY - 20;
      ctx.fillStyle = accentColor;
      ctx.shadowBlur = 15;
      ctx.shadowColor = accentColor;
      ctx.fillRect(50, pY, PLAYER_SIZE, PLAYER_SIZE);
      
      ctx.fillStyle = '#fff';
      ctx.fillRect(55, pY + 5, 5, 5);

      // Draw Obstacles
      ctx.fillStyle = secondaryColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = secondaryColor;
      gameRef.current.obstacles.forEach(obs => {
        ctx.fillRect(obs.x, canvas.height - obs.height - 20, obs.width, obs.height);
        ctx.strokeStyle = accentColor;
        ctx.strokeRect(obs.x, canvas.height - obs.height - 20, obs.width, obs.height);
      });

      ctx.shadowBlur = 0;
    };

    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, accentColor]);

  return (
    <div className="relative group w-full max-w-4xl h-full flex items-center justify-center">
      <div className="relative glass-panel rounded-xl overflow-hidden p-4 w-full h-[calc(100%-20px)] flex flex-col"
           style={{ borderColor: `${accentColor}4D` }}>
        <div className="flex justify-between items-center mb-2 px-2">
          <div className="text-sm font-orbitron" style={{ color: accentColor }}>NEURAL RUNNER // VELOCITY: HIGH</div>
          <div className="text-xl font-bold font-orbitron">
            SCORE: <span className="text-white tracking-widest">{Math.floor(score / 10)}</span>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center">
            <canvas 
            ref={canvasRef} 
            width={1000} 
            height={300} 
            className="w-full h-auto rounded-lg bg-black/40"
            />
        </div>
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20">
            <h2 className="text-3xl font-orbitron text-red-500 mb-4 tracking-widest animate-pulse">CONNECTION LOST</h2>
            <button 
              onClick={resetGame}
              className="px-8 py-3 text-white font-orbitron rounded-full neon-border transition-all active:scale-95"
              style={{ backgroundColor: `${accentColor}CC`, boxShadow: `0 0 15px ${accentColor}` }}
            >
              RESTORE LINK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;

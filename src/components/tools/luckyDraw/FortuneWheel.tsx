import React, { useState, useEffect, useRef } from 'react';
import type { LuckyDrawPrize, LuckyDrawWinner } from '../../../hooks/useLuckyDraw';
import { Trophy } from 'lucide-react';

interface FortuneWheelProps {
  prizes: LuckyDrawPrize[];
  onSpinEnd?: (prize: LuckyDrawPrize, winner: LuckyDrawWinner) => void;
  isSpinning: boolean;
  selectedPrize?: LuckyDrawPrize;
  winner?: LuckyDrawWinner;
}

export function FortuneWheel({ prizes, onSpinEnd, isSpinning, selectedPrize, winner }: FortuneWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || prizes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save the current context state
    ctx.save();

    // Rotate the entire wheel
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // Draw wheel sections
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
    let startAngle = 0;

    prizes.forEach((prize, index) => {
      const angle = (prize.probability / totalProbability) * 2 * Math.PI;
      
      // Draw section
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
      ctx.closePath();

      // Alternate colors
      ctx.fillStyle = index % 2 === 0 ? '#4F46E5' : '#6366F1';
      ctx.fill();
      ctx.stroke();

      // Add text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + angle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.fillText(prize.name, radius - 20, 5);
      ctx.restore();

      startAngle += angle;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX + 30, centerY);
    ctx.lineTo(centerX + 50, centerY - 10);
    ctx.lineTo(centerX + 50, centerY + 10);
    ctx.closePath();
    ctx.fillStyle = '#EF4444';
    ctx.fill();

    // Restore the context state
    ctx.restore();
  }, [prizes, rotation]);

  useEffect(() => {
    if (isSpinning && !isAnimating && selectedPrize) {
      setIsAnimating(true);
      
      // Calculate target rotation based on selected prize
      const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
      let targetAngle = 0;
      let currentProbability = 0;

      for (const prize of prizes) {
        if (prize.id === selectedPrize.id) break;
        currentProbability += prize.probability;
        targetAngle += (prize.probability / totalProbability) * 360;
      }

      // Add extra rotations for effect
      const finalRotation = 3600 + targetAngle;
      let currentRotation = rotation;

      const animate = () => {
        if (currentRotation >= finalRotation) {
          setIsAnimating(false);
          onSpinEnd?.(selectedPrize, winner);
          return;
        }

        const remaining = finalRotation - currentRotation;
        const step = Math.max(1, remaining * 0.05);
        currentRotation += step;
        setRotation(currentRotation % 360);
        requestAnimationFrame(animate);
      };

      animate();
    }
  }, [isSpinning, selectedPrize]);

  // Reset winner when starting a new spin
  useEffect(() => {
    if (isSpinning) {
      // Reset animation state only
      setIsAnimating(false);
    }
  }, [isSpinning]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="max-w-full h-auto rounded-full shadow-xl"
        />
        
        {/* Spinning Overlay */}
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
            <div className="text-lg font-medium text-white animate-pulse">
              Spinning...
            </div>
          </div>
        )}
      </div>

      {/* Winner Display */}
      {winner && (
        <div className="mt-6 text-center animate-fade-up">
          <div className="inline-flex flex-col items-center px-8 py-6 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
            <div className="text-white">
              <div className="text-lg font-medium">Congratulations!</div>
              <div className="text-2xl font-bold mt-2">{winner.first_name} {winner.last_name}</div>
              <div className="text-base mt-1">{winner.phone}</div>
              <div className="text-lg font-medium mt-3 px-4 py-2 bg-white/20 rounded-lg">
                Won: {winner.prize_name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
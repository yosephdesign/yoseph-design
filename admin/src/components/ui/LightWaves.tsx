import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

interface LightWavesProps {
  className?: string;
  count?: number;
  speed?: number;
  color?: string;
}

export const LightWaves: React.FC<LightWavesProps> = ({
  className,
  count = 3,
  speed = 1,
  color = "rgba(0, 0, 0, 0.03)",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.005 * speed;

      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        const offset = i * 20;
        const amplitude = 50 + i * 10;
        const frequency = 0.005;

        for (let x = 0; x <= canvas.width; x += 10) {
          const y =
            canvas.height / 2 +
            Math.sin(x * frequency + time + offset) * amplitude +
            Math.sin(x * frequency * 0.5 + time) * amplitude * 0.5;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, speed, color]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 -z-10 pointer-events-none opacity-50", className)}
    />
  );
};
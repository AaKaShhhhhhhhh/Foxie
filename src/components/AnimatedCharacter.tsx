import React, { useEffect, useRef } from 'react';

export default function AnimatedCharacter({ mood = 'happy', onClick }: { mood?: string; onClick?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let t = 0;

    const resize = () => {
      canvas.width = 200;
      canvas.height = 200;
    };
    resize();

    const draw = () => {
      t += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // simple breathing circle and eyes — placeholder for richer SVG
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 40 + Math.sin(t) * 3;
      ctx.fillStyle = mood === 'happy' ? '#ffb86b' : '#ddd';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(cx - 15, cy - 5, 5, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [mood]);

  return (
    <canvas ref={canvasRef} width={200} height={200} style={{ cursor: 'pointer' }} onClick={onClick} />
  );
}

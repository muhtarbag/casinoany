import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LightRaysProps {
  raysOrigin?: 'top-center' | 'center' | 'bottom-center';
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
}

export const LightRays = ({
  raysOrigin = 'top-center',
  raysColor = '#00ffff',
  raysSpeed = 1.5,
  lightSpread = 0.8,
  rayLength = 1.2,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0.1,
  distortion = 0.05,
  className
}: LightRaysProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animationRef = useRef<number>();

  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 255, 255]; // fallback cyan
  };

  const [r, g, b] = hexToRgb(raysColor);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      if (followMouse) {
        mouseRef.current = {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight
        };
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const rayCount = 40;

    const getOrigin = () => {
      const baseX = canvas.width / 2;
      let baseY = 0;
      
      if (raysOrigin === 'center') baseY = canvas.height / 2;
      else if (raysOrigin === 'bottom-center') baseY = canvas.height;
      
      if (followMouse) {
        return {
          x: baseX + (mouseRef.current.x - 0.5) * canvas.width * mouseInfluence,
          y: baseY + (mouseRef.current.y - 0.5) * canvas.height * mouseInfluence
        };
      }
      return { x: baseX, y: baseY };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01 * raysSpeed;

      const origin = getOrigin();

      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 * lightSpread;
        const noise = Math.sin(time + i) * noiseAmount;
        const finalAngle = angle + noise;

        const distortionX = Math.sin(time * 2 + i) * distortion * 100;
        const distortionY = Math.cos(time * 2 + i) * distortion * 100;

        const endX = origin.x + Math.cos(finalAngle) * canvas.height * rayLength + distortionX;
        const endY = origin.y + Math.sin(finalAngle) * canvas.height * rayLength + distortionY;

        const gradient = ctx.createLinearGradient(origin.x, origin.y, endX, endY);
        const opacity = 0.05 + Math.sin(time + i) * 0.03;
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [raysOrigin, raysSpeed, lightSpread, rayLength, followMouse, mouseInfluence, noiseAmount, distortion, r, g, b]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default LightRays;

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get computed color from CSS variable if needed
    const getComputedColor = (color: string): string => {
      if (color.includes('var(')) {
        const computedStyle = getComputedStyle(document.documentElement);
        const hslValue = computedStyle.getPropertyValue('--primary').trim();
        if (hslValue) {
          // Convert HSL to RGB for canvas
          const [h, s, l] = hslValue.split(' ').map(v => parseFloat(v));
          const rgb = hslToRgb(h, s / 100, l / 100);
          return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        }
      }
      return color;
    };

    const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, (h / 360) + 1/3);
        g = hue2rgb(p, q, h / 360);
        b = hue2rgb(p, q, (h / 360) - 1/3);
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    const computedRaysColor = getComputedColor(raysColor);

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
        
        // Extract RGB values and create rgba string
        const rgbMatch = computedRaysColor.match(/\d+/g);
        if (rgbMatch) {
          const [r, g, b] = rgbMatch.map(Number);
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          // Fallback to cyan if parsing fails
          gradient.addColorStop(0, `rgba(0, 255, 255, ${opacity})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

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
  }, [raysOrigin, raysColor, raysSpeed, lightSpread, rayLength, followMouse, mouseInfluence, noiseAmount, distortion]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default LightRays;

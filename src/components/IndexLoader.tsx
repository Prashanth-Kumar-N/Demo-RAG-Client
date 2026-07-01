// IndexLoader.tsx
// Full-screen cinematic loading experience shown while the RAG index is being loaded from disk.
// Features: animated radar sweep, grid topography, status messages cycling, progress bar.

import { useEffect, useState, useRef } from 'react';
import RAGLogo from './RAGLogo';

interface IndexLoaderProps {
  onLoaded?: () => void;
}

const STATUS_MESSAGES: string[] = [
  'Establishing secure connection...',
  'Retrieving vector store from disk...',
  'Deserializing index embeddings...',
  'Warming up retrieval pipeline...',
  'Loading safety manuals corpus...',
  'Indexing warehouse logistics data...',
  'Calibrating defence document vectors...',
  'Running similarity search checks...',
  'System ready — finalising...',
];

const IndexLoader = ({ onLoaded }: IndexLoaderProps) => {
  const [messageIdx, setMessageIdx] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [fadeOut, setFadeOut] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const angleRef = useRef<number>(0);

  // Cycle through status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => {
        if (prev < STATUS_MESSAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerate toward 90 then slow
        const increment = prev < 85 ? Math.random() * 4 + 2 : Math.random() * 0.8 + 0.2;
        return Math.min(prev + increment, 100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Radar canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) / 2 - 4;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background circle
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(196, 114, 0, 0.04)';
      ctx.fill();

      // Concentric rings
      [0.25, 0.5, 0.75, 1].forEach((ratio) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * ratio, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(196, 114, 0, 0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Cross-hairs
      ctx.strokeStyle = 'rgba(196, 114, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
      ctx.stroke();

      // Diagonal lines
      const d = R * Math.cos(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d);
      ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d);
      ctx.stroke();

      // Sweep gradient (trailing glow)
      const sweepAngle = angleRef.current;
      const trailLength = Math.PI * 0.6;

      // Draw trail as multiple arcs with decreasing opacity
      for (let i = 0; i < 30; i++) {
        const ratio = i / 30;
        const arcStart = sweepAngle - trailLength * (1 - ratio);
        const arcEnd = sweepAngle - trailLength * (1 - ratio) + (trailLength / 30);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R - 2, arcStart, arcEnd);
        ctx.closePath();
        ctx.fillStyle = `rgba(196, 114, 0, ${0.12 * ratio})`;
        ctx.fill();
      }

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + (R - 2) * Math.cos(sweepAngle), cy + (R - 2) * Math.sin(sweepAngle));
      ctx.strokeStyle = 'rgba(196, 114, 0, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Blip dots — static positions that "ping" as the sweep passes
      const blips = [
        { a: 0.8, r: 0.42 },
        { a: 2.1, r: 0.68 },
        { a: 3.8, r: 0.3 },
        { a: 5.0, r: 0.55 },
        { a: 1.3, r: 0.78 },
        { a: 4.2, r: 0.62 },
      ];

      blips.forEach(({ a, r }) => {
        const bx = cx + R * r * Math.cos(a);
        const by = cy + R * r * Math.sin(a);
        // brightness based on distance from sweep angle
        let delta = ((sweepAngle - a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (delta > Math.PI * 2) delta -= Math.PI * 2;
        const brightness = Math.max(0, 1 - delta / (Math.PI * 0.8));

        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 114, 0, ${0.15 + brightness * 0.85})`;
        ctx.fill();

        if (brightness > 0.4) {
          ctx.beginPath();
          ctx.arc(bx, by, 2.5 + brightness * 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196, 114, 0, ${brightness * 0.15})`;
          ctx.fill();
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(196, 114, 0, 0.7)';
      ctx.fill();

      angleRef.current = (angleRef.current + 0.022) % (Math.PI * 2);
      animFrameRef.current = requestAnimationFrame(draw);
    };

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // When progress hits 100, trigger fade out then call onLoaded
  useEffect(() => {
    if (progress >= 100) {
      const t1 = setTimeout(() => setFadeOut(true), 600);
      const t2 = setTimeout(() => onLoaded && onLoaded(), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [progress, onLoaded]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(145deg, #F7F3EE 0%, #EFE8DF 50%, #F2EDE6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'opacity 0.6s ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all',
        fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(196,114,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(196,114,0,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Corner decorators */}
      {[
        { top: 24, left: 24 },
        { top: 24, right: 24 },
        { bottom: 24, left: 24 },
        { bottom: 24, right: 24 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            borderTop: ['top', 'top', undefined, undefined][i] !== undefined ? '2px solid rgba(196,114,0,0.3)' : undefined,
            borderBottom: ['bottom', 'bottom'].includes(Object.keys(pos)[0]) ? '2px solid rgba(196,114,0,0.3)' : undefined,
            borderLeft: [0, 2].includes(i) ? '2px solid rgba(196,114,0,0.3)' : undefined,
            borderRight: [1, 3].includes(i) ? '2px solid rgba(196,114,0,0.3)' : undefined,
            ...pos,
          }}
        />
      ))}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        {/* Logo */}
        <RAGLogo size={44} showText />

        {/* Radar */}
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={180}
            height={180}
            style={{ display: 'block' }}
          />
          {/* Radar label */}
          <div style={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            color: 'rgba(196,114,0,0.5)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            VECTOR RETRIEVAL
          </div>
        </div>

        {/* Status text */}
        <div style={{
          marginTop: '0.5rem',
          minHeight: '1.5rem',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '0.82rem',
            color: '#6B7B8D',
            letterSpacing: '0.01em',
            transition: 'opacity 0.3s ease',
            margin: 0,
          }}>
            {STATUS_MESSAGES[messageIdx]}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          width: 280,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center',
        }}>
          <div style={{
            width: '100%',
            height: 3,
            background: 'rgba(196,114,0,0.12)',
            borderRadius: 99,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #C47200, #E88B00)',
              borderRadius: 99,
              transition: 'width 0.15s ease',
              boxShadow: '0 0 8px rgba(196,114,0,0.5)',
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <span style={{ fontSize: '0.68rem', color: 'rgba(196,114,0,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Initialising Index
            </span>
            <span style={{ fontSize: '0.68rem', color: 'rgba(196,114,0,0.7)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexLoader;

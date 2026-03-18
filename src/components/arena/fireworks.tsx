import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  gravity: number;
  decay: number;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

const GOLD = ["#facc15", "#fbbf24", "#f59e0b", "#fde68a", "#fffbeb"];
const PURPLE = ["#a855f7", "#c084fc", "#d8b4fe", "#8b5cf6", "#7c3aed"];
const GREEN = ["#00ff88", "#4ade80", "#22c55e", "#10b981", "#6ee7b7"];
const CYAN = ["#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface FireworksProps {
  rank: number;
  active: boolean;
}

export function Fireworks({ rank, active }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<Rocket[]>([]);
  const lastLaunchRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const palette = rank === 1 ? GOLD : rank === 2 ? PURPLE : GREEN;
    const interval = rank === 1 ? 400 : rank === 2 ? 700 : 1000;
    const count = rank === 1 ? 80 : rank === 2 ? 60 : 40;

    function explode(x: number, y: number) {
      const colors = rank === 1 ? [...palette, ...CYAN] : palette;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 4;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: pick(colors),
          size: 1.5 + Math.random() * 2,
          gravity: 0.03 + Math.random() * 0.02,
          decay: 0.008 + Math.random() * 0.008,
        });
      }
      if (rank === 1) {
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          particlesRef.current.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color: "#ffffff",
            size: 1 + Math.random(),
            gravity: 0.01,
            decay: 0.02,
          });
        }
      }
    }

    function loop() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);

      const now = Date.now();
      if (now - lastLaunchRef.current > interval) {
        lastLaunchRef.current = now;
        rocketsRef.current.push({
          x: w * 0.15 + Math.random() * w * 0.7,
          y: h,
          targetY: h * 0.15 + Math.random() * h * 0.35,
          vy: -(5 + Math.random() * 3),
          color: pick(palette),
          exploded: false,
          trail: [],
        });
      }

      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        if (!r.exploded) {
          r.trail.push({ x: r.x, y: r.y, alpha: 1 });
          if (r.trail.length > 8) r.trail.shift();
          r.y += r.vy;
          for (const t of r.trail) t.alpha *= 0.85;
          for (const t of r.trail) {
            ctx!.beginPath();
            ctx!.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
            ctx!.fillStyle = r.color + Math.floor(t.alpha * 255).toString(16).padStart(2, "0");
            ctx!.fill();
          }
          ctx!.beginPath();
          ctx!.arc(r.x, r.y, 2, 0, Math.PI * 2);
          ctx!.fillStyle = r.color;
          ctx!.fill();
          if (r.y <= r.targetY) {
            r.exploded = true;
            explode(r.x, r.y);
          }
        } else {
          rocketsRef.current.splice(i, 1);
        }
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.life -= p.decay;
        if (p.life <= 0) { particlesRef.current.splice(i, 1); continue; }
        const a = Math.max(0, p.life);
        ctx!.globalAlpha = a;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.fill();
        if (rank === 1 && a > 0.5) {
          ctx!.globalAlpha = a * 0.3;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.size * a * 3, 0, Math.PI * 2);
          ctx!.fillStyle = p.color;
          ctx!.fill();
        }
        ctx!.globalAlpha = 1;
      }

      frameRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      particlesRef.current = [];
      rocketsRef.current = [];
    };
  }, [active, rank]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

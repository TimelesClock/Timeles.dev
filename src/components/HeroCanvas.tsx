// HeroCanvas.tsx
// Glowing geometric particles — canvas bloom via layered shadow rendering
// No WebGL, no physics, crisp at any DPR

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    baseOpacity: number;
    pulsePhase: number;
    pulseSpeed: number;
    color: string;
    glowColor: string;
    type: "diamond" | "triangle" | "square" | "hexagon";
}

const PALETTE = [
    { color: "#ffffff", glow: "#88aaff" },
    { color: "#c8d8ff", glow: "#4477ff" },
    { color: "#ffd0a0", glow: "#ff8822" },
    { color: "#a0ffd8", glow: "#00ffaa" },
    { color: "#e0ccff", glow: "#9966ff" },
];

function polygon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    sides: number,
    rotation: number
) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
}

function drawDiamond(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    rotation: number
) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const pts: [number, number][] = [[0, -r], [r * 0.55, 0], [0, r], [-r * 0.55, 0]];
    ctx.beginPath();
    pts.forEach(([px, py], i) => {
        const rx = px * cos - py * sin + cx;
        const ry = px * sin + py * cos + cy;
        i === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
    });
    ctx.closePath();
}

type DrawFn = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rot: number) => void;

const SHAPES: Record<Particle["type"], DrawFn> = {
    diamond: (ctx, cx, cy, r, rot) => drawDiamond(ctx, cx, cy, r, rot),
    triangle: (ctx, cx, cy, r, rot) => polygon(ctx, cx, cy, r, 3, rot),
    square: (ctx, cx, cy, r, rot) => polygon(ctx, cx, cy, r, 4, rot + Math.PI / 4),
    hexagon: (ctx, cx, cy, r, rot) => polygon(ctx, cx, cy, r, 6, rot),
};

const PARTICLE_COUNT = 42;

export default function HeroCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const frameRef = useRef<number>(0);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const tRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const ctx = canvas.getContext("2d")!;

        const resize = () => {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const typeKeys: Particle["type"][] = ["diamond", "triangle", "square", "hexagon"];

        particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
            const swatch = PALETTE[Math.floor(Math.random() * PALETTE.length)];
            return {
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                size: Math.random() * 18 + 9,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.007,
                baseOpacity: Math.random() * 0.45 + 0.25,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.7 + 0.4,
                color: swatch.color,
                glowColor: swatch.glow,
                type: typeKeys[Math.floor(Math.random() * typeKeys.length)],
            };
        });

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        const onTouchMove = (e: TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        };
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("touchmove", onTouchMove, { passive: true });

        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);
            tRef.current += 0.016;
            const t = tRef.current;

            const W = canvas.offsetWidth;
            const H = canvas.offsetHeight;

            ctx.clearRect(0, 0, W, H);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const REPEL = 140;

            for (const p of particlesRef.current) {
                const dx = p.x - mx;
                const dy = p.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Repulsion
                if (dist < REPEL && dist > 0) {
                    const f = ((REPEL - dist) / REPEL) * 0.75;
                    p.vx += (dx / dist) * f * 0.06;
                    p.vy += (dy / dist) * f * 0.06;
                }

                p.vx *= 0.984;
                p.vy *= 0.984;
                const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (spd > 1.6) { p.vx = (p.vx / spd) * 1.6; p.vy = (p.vy / spd) * 1.6; }

                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;

                if (p.x < -50) p.x = W + 50;
                if (p.x > W + 50) p.x = -50;
                if (p.y < -50) p.y = H + 50;
                if (p.y > H + 50) p.y = -50;

                const pulse = Math.sin(t * p.pulseSpeed + p.pulsePhase);
                const proximity = dist < REPEL ? (1 - dist / REPEL) : 0;
                const alpha = Math.min(1, p.baseOpacity + pulse * 0.2 + proximity * 0.65);

                const drawShape = SHAPES[p.type];

                // ── Pass 1: wide blur halo ──────────────────────────
                ctx.save();
                ctx.globalAlpha = alpha * 0.12;
                ctx.filter = `blur(${Math.round(p.size * 1.4)}px)`;
                ctx.strokeStyle = p.glowColor;
                ctx.lineWidth = p.size * 1.6;
                drawShape(ctx, p.x, p.y, p.size, p.rotation);
                ctx.stroke();
                ctx.restore();

                // ── Pass 2: medium glow ring ────────────────────────
                ctx.save();
                ctx.globalAlpha = alpha * 0.4;
                ctx.shadowColor = p.glowColor;
                ctx.shadowBlur = p.size * 3;
                ctx.strokeStyle = p.glowColor;
                ctx.lineWidth = 3;
                drawShape(ctx, p.x, p.y, p.size, p.rotation);
                ctx.stroke();
                ctx.restore();

                // ── Pass 3: crisp bright outline ───────────────────
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = p.size;
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1.5;
                drawShape(ctx, p.x, p.y, p.size * 0.82, p.rotation);
                ctx.stroke();
                ctx.restore();

                // ── Pass 4: centre spark on hover ──────────────────
                if (proximity > 0.25) {
                    ctx.save();
                    ctx.globalAlpha = (proximity - 0.25) * 1.5;
                    ctx.fillStyle = p.color;
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(frameRef.current);
            ro.disconnect();
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("touchmove", onTouchMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        />
    );
}
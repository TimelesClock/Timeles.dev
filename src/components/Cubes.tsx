import { useEffect, useRef } from "react";

type V3 = [number, number, number];

const rotX = ([x, y, z]: V3, a: number): V3 => {
    const c = Math.cos(a), s = Math.sin(a);
    return [x, c * y - s * z, s * y + c * z];
};
const rotY = ([x, y, z]: V3, a: number): V3 => {
    const c = Math.cos(a), s = Math.sin(a);
    return [c * x + s * z, y, -s * x + c * z];
};
const rotZ = ([x, y, z]: V3, a: number): V3 => {
    const c = Math.cos(a), s = Math.sin(a);
    return [c * x - s * y, s * x + c * y, z];
};

const project = ([x, y, z]: V3, fov: number): [number, number, number] => {
    const d = fov / (fov + z + 0.001);
    return [x * d, y * d, z];
};

const a = (1 + Math.sqrt(5)) / 2;
const NORM = Math.sqrt(1 + a * a);

const ICOS_VERTS: V3[] = [
    [-1, a, 0], [1, a, 0], [-1, -a, 0], [1, -a, 0],
    [0, -1, a], [0, 1, a], [0, -1, -a], [0, 1, -a],
    [a, 0, -1], [a, 0, 1], [-a, 0, -1], [-a, 0, 1],
].map(([x, y, z]) => [x / NORM, y / NORM, z / NORM] as V3);

const ICOS_FACES: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

interface Gem {
    x: number; y: number;
    vx: number; vy: number;
    rx: number; ry: number; rz: number;
    drx: number; dry: number; drz: number;
    size: number;
    glow: number;
    glowTarget: number;

    ambientLight: number;
}

const COUNT = 28;
const FOV = 380;
const RESTITUTION = 0.7;

function makeGem(W: number, H: number): Gem {
    const size = Math.random() * 20 + 20;
    return {
        x: size + Math.random() * (W - size * 2),
        y: size + Math.random() * (H - size * 2),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        drx: (Math.random() - 0.5) * 0.006,
        dry: (Math.random() - 0.5) * 0.010,
        drz: (Math.random() - 0.5) * 0.005,
        size,
        glow: 0,
        glowTarget: 0,
        ambientLight: 0,
    };
}
export default function FallingCubes2D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);
    const gemsRef = useRef<Gem[]>([]);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const sizeRef = useRef({ W: 0, H: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const ctx = canvas.getContext("2d")!;

        const resize = () => {
            const W = canvas.offsetWidth;
            const H = canvas.offsetHeight;
            if (!W || !H) return;
            sizeRef.current = { W, H };
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const { W, H } = sizeRef.current;
        gemsRef.current = Array.from({ length: COUNT }, () => makeGem(W, H));

        const HOVER_R = 100;

        const handlePointer = (cx: number, cy: number) => {
            const rect = canvas.getBoundingClientRect();
            const mx = cx - rect.left;
            const my = cy - rect.top;
            mouseRef.current = { x: mx, y: my };
        };

        const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => handlePointer(e.touches[0].clientX, e.touches[0].clientY);
        const onTouchStart = (e: TouchEvent) => handlePointer(e.touches[0].clientX, e.touches[0].clientY);
        const onPointerEnd = () => { mouseRef.current = { x: -9999, y: -9999 }; };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchend", onPointerEnd);


        const drawGem = (g: Gem) => {
            const rotated = ICOS_VERTS.map(v => {
                let r = rotX(v, g.rx);
                r = rotY(r, g.ry);
                r = rotZ(r, g.rz);
                return [r[0] * g.size, r[1] * g.size, r[2] * g.size] as V3;
            });

            const projected = rotated.map(v => project(v, FOV));

            const faces = ICOS_FACES.map(([i, j, k]) => ({
                i, j, k,
                depth: (rotated[i][2] + rotated[j][2] + rotated[k][2]) / 3,
            })).sort((a, b) => a.depth - b.depth);

            const glow = g.glow;
            const ambient = g.ambientLight;

            for (const face of faces) {
                const [ax, ay] = projected[face.i];
                const [bx, by] = projected[face.j];
                const [cx, cy] = projected[face.k];

                const ex = bx - ax, ey = by - ay;
                const fx = cx - ax, fy = cy - ay;
                const nz = ex * fy - ey * fx;
                const nLen = Math.abs(nz) || 1;
                const diffuse = Math.max(0, Math.min(1, nz / (nLen * 1.5) + 0.5));

                const px = g.x + ax, py = g.y + ay;
                const qx = g.x + bx, qy = g.y + by;
                const rx2 = g.x + cx, ry2 = g.y + cy;

                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(qx, qy);
                ctx.lineTo(rx2, ry2);
                ctx.closePath();

                if (glow > 0.01) {
                    const a = (0.05 + diffuse * 0.10) + glow * 0.18;
                    ctx.fillStyle = `rgba(255,${Math.round(140 + diffuse * 80)},30,${a})`;
                } else if (ambient > 0.02) {
                    const a = (0.03 + diffuse * 0.05) + ambient * 0.10;
                    ctx.fillStyle = `rgba(255,${Math.round(120 + diffuse * 60)},20,${a})`;
                } else {
                    const a = 0.03 + diffuse * 0.05;
                    ctx.fillStyle = `rgba(220,225,255,${a})`;
                }
                ctx.fill();

                const totalGlow = Math.max(glow, ambient * 0.6);
                if (totalGlow > 0.01) {
                    const edgeAlpha = 0.25 + totalGlow * 0.65;
                    const green = Math.round(160 + diffuse * 70);
                    ctx.strokeStyle = `rgba(255,${green},50,${edgeAlpha})`;
                    ctx.lineWidth = 0.6 + totalGlow * 1.6;
                    ctx.shadowColor = `rgba(255,150,30,${totalGlow * 0.8})`;
                    ctx.shadowBlur = totalGlow * 28;
                } else {
                    ctx.strokeStyle = `rgba(200,210,255,${0.10 + diffuse * 0.08})`;
                    ctx.lineWidth = 0.6;
                    ctx.shadowBlur = 0;
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        };

        const tick = () => {
            frameRef.current = requestAnimationFrame(tick);
            const { W, H } = sizeRef.current;
            if (!W || !H) return;

            ctx.clearRect(0, 0, W, H);

            const gems = gemsRef.current;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            for (const g of gems) {
                const dx = g.x - mx;
                const dy = g.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                g.glowTarget = dist < HOVER_R ? 1 : 0;

                if (dist < HOVER_R && dist > 1) {
                    const f = ((HOVER_R - dist) / HOVER_R) * 0.015;
                    g.vx += (dx / dist) * f;
                    g.vy += (dy / dist) * f;
                    g.dry += (Math.random() - 0.5) * 0.006;
                }

                g.glow += (g.glowTarget - g.glow) * 0.07;

                g.vx *= 0.994;
                g.vy *= 0.994;
                const spd = Math.sqrt(g.vx * g.vx + g.vy * g.vy);
                if (spd > 1.4) { g.vx = (g.vx / spd) * 1.4; g.vy = (g.vy / spd) * 1.4; }

                g.x += g.vx;
                g.y += g.vy;

                const margin = g.size * 0.85;
                if (g.x < margin) { g.x = margin; g.vx = Math.abs(g.vx) * RESTITUTION; }
                if (g.x > W - margin) { g.x = W - margin; g.vx = -Math.abs(g.vx) * RESTITUTION; }
                if (g.y < margin) { g.y = margin; g.vy = Math.abs(g.vy) * RESTITUTION; }
                if (g.y > H - margin) { g.y = H - margin; g.vy = -Math.abs(g.vy) * RESTITUTION; }

                g.rx += g.drx;
                g.ry += g.dry;
                g.rz += g.drz;

                const BASE = 0.005;
                g.dry += (Math.sign(g.dry || 1) * BASE - g.dry) * 0.015;
                g.drx += (Math.sign(g.drx || 1) * 0.003 - g.drx) * 0.015;
            }

            const LIGHT_R = 220;
            for (const g of gems) {
                g.ambientLight = 0;
                for (const other of gems) {
                    if (other === g || other.glow < 0.05) continue;
                    const dx = g.x - other.x;
                    const dy = g.y - other.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < LIGHT_R) {
                        const contrib = other.glow * Math.pow(1 - d / LIGHT_R, 2);
                        g.ambientLight = Math.min(1, g.ambientLight + contrib);
                    }
                }
            }

            for (const g of gems) {
                const totalLight = Math.max(g.glow, g.ambientLight * 0.4);
                if (totalLight < 0.04) continue;

                const R = g.size * (4 + g.glow * 4);
                const gr = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, R);
                gr.addColorStop(0, `rgba(255,170,40,${totalLight * 0.22})`);
                gr.addColorStop(0.3, `rgba(255,120,20,${totalLight * 0.10})`);
                gr.addColorStop(0.65, `rgba(255,80,10,${totalLight * 0.04})`);
                gr.addColorStop(1, "rgba(255,60,0,0)");

                ctx.beginPath();
                ctx.arc(g.x, g.y, R, 0, Math.PI * 2);
                ctx.fillStyle = gr;
                ctx.fill();
            }

            const sorted = [...gems].sort((a, b) => a.y - b.y);
            for (const g of sorted) drawGem(g);
        };

        tick();

        return () => {
            cancelAnimationFrame(frameRef.current);
            ro.disconnect();
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchend", onPointerEnd);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                display: "block",
                pointerEvents: "none",
            }}
        />
    );
}
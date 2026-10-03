"use client";

import { useEffect, useRef } from "react";

type P = [number, number];

const N = 34; // isolines in the loft
const W = 900;
const H = 620;

// Two rail curves (cubic béziers). Control points of the loft interpolate between them.
const railA: P[] = [[40, 470], [250, 120], [520, 560], [860, 190]];
const railB: P[] = [[60, 560], [300, 330], [560, 610], [850, 400]];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function SurfaceHero() {
  const svg = useRef<SVGSVGElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const handles = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const target = { x: 0.5, y: 0.5 };
    const cur = { x: 0.5, y: 0.5 };
    let raf = 0;
    let t0 = performance.now();

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      target.y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    };
    window.addEventListener("pointermove", onMove);

    const draw = (now: number) => {
      const time = (now - t0) / 1000;
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      const drift = reduce ? 0 : 1;

      // Displace inner control points with pointer + gentle idle breathing.
      const warp = (pts: P[], phase: number): P[] =>
        pts.map(([x, y], i) => {
          if (i === 0 || i === 3) return [x, y] as P;
          const k = i === 1 ? 1 : -1;
          return [
            x + (cur.x - 0.5) * 140 * k + Math.sin(time * 0.7 + phase + i) * 14 * drift,
            y + (cur.y - 0.5) * 120 * k + Math.cos(time * 0.6 + phase * 2 + i) * 18 * drift,
          ] as P;
        });

      const a = warp(railA, 0);
      const b = warp(railB, 1.7);

      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const c = a.map((p, j) => [lerp(p[0], b[j][0], u), lerp(p[1], b[j][1], u)] as P);
        const d = `M${c[0][0].toFixed(1)} ${c[0][1].toFixed(1)}C${c[1][0].toFixed(1)} ${c[1][1].toFixed(1)} ${c[2][0].toFixed(1)} ${c[2][1].toFixed(1)} ${c[3][0].toFixed(1)} ${c[3][1].toFixed(1)}`;
        paths.current[i]?.setAttribute("d", d);
      }
      [a[1], a[2], b[1], b[2]].forEach((p, i) => {
        handles.current[i]?.setAttribute("cx", p[0].toFixed(1));
        handles.current[i]?.setAttribute("cy", p[1].toFixed(1));
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <svg
      ref={svg}
      className="surface"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="iso" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="0.55" stopColor="#f3efe6" stopOpacity="0.85" />
          <stop offset="1" stopColor="#f3efe6" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {Array.from({ length: N }, (_, i) => (
        <path
          key={i}
          ref={(n) => {
            paths.current[i] = n;
          }}
          fill="none"
          stroke="url(#iso)"
          strokeWidth={i === 0 || i === N - 1 ? 1.6 : 0.8}
          opacity={i === 0 || i === N - 1 ? 1 : 0.25 + (i / N) * 0.5}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle
          key={i}
          ref={(n) => {
            handles.current[i] = n;
          }}
          r="4"
          className="handle"
        />
      ))}
    </svg>
  );
}

"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  layer: number;
};

/**
 * 星空背景：Canvas 2D 粒子，缓慢闪烁 + 视差。
 * - 移动端降低粒子数，dpr 上限 2
 * - 尊重 prefers-reduced-motion
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxRaw = canvasEl.getContext("2d");
    if (!ctxRaw) return;
    // 用非空类型绑定，供闭包（resize/draw）安全使用
    const canvas = canvasEl;
    const ctx = ctxRaw;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let running = true;

    let offsetX = 0;
    let offsetY = 0;
    let targetX = 0;
    let targetY = 0;

    function build() {
      const count = window.innerWidth < 640 ? 50 : window.innerWidth > 1024 ? 150 : 100;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0016 + 0.0004,
        layer: Math.random() * 0.5 + 0.3,
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function onScroll() {
      targetY = window.scrollY * 0.02;
    }
    function onPointer(e: PointerEvent) {
      targetX = (e.clientX / window.innerWidth - 0.5) * 20;
      targetY = (e.clientY / window.innerHeight - 0.5) * 20;
    }

    function draw(t: number) {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      offsetX += (targetX - offsetX) * 0.05;
      offsetY += (targetY - offsetY) * 0.05;

      for (const p of particles) {
        const alpha = reduced ? 0.6 : 0.35 + 0.35 * Math.sin(t * p.speed + p.phase);
        const px = p.x + offsetX * p.layer;
        const py = p.y + offsetY * p.layer;
        ctx.beginPath();
        ctx.fillStyle = `rgba(230, 234, 242, ${alpha})`;
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });

    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}

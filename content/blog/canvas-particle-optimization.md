---
title: "用 Canvas 优化粒子动画的性能实践"
summary: "从掉帧到稳定 60fps：记录一次星空粒子背景的性能优化。"
date: "2026-10-08"
tags: ["Canvas", "性能"]
---

## 背景

给网站做星空背景时，粒子动画在移动端出现了明显掉帧。本文记录完整的排查与优化过程。

## 问题定位

最初的实现每秒渲染大量粒子，每次 `requestAnimationFrame` 都做全量绘制。

```js
// ❌ 每次都创建新对象，触发频繁 GC
function draw() {
  particles.forEach((p) => {
    ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
}
```

## 优化手段

### 降低粒子数量

移动端把粒子数从 150 降到 50，视觉上几乎无差别，绘制开销显著下降。

### 限制 devicePixelRatio

高分屏上 `dpr` 可达 3，绘制像素翻倍。把 `dpr` 上限设为 2 即可明显提速。

### 尊重偏好设置

```js
// ✅ 尊重 prefers-reduced-motion，渲染静态星点
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
```

## 结论

通过「降数量 + 限 dpr + 减动画」三步，移动端稳定在 50fps 以上。

| 优化项 | 效果 |
| --- | --- |
| 降低粒子数 | 绘制开销减半 |
| 限制 dpr | 高分屏提速明显 |
| 减动画 | 尊重用户偏好 |

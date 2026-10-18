import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出：构建产物输出到 out/，用于 Cloudflare Pages 托管
  output: "export",
};

export default nextConfig;

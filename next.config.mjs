/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: "/Users/simeonrubin/Desktop/Coding/shader-cn",
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": require("path").resolve(__dirname, "./client"),
      "@shared": require("path").resolve(__dirname, "./shared"),
    };
    return config;
  },
};

export default nextConfig;

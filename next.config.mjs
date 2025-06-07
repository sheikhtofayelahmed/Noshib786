import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your config options
  reactStrictMode: true,
  // more options...
};

export default nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);

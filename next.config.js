/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // saca console.log del bundle de producción (deja warn/error para no perder
  // señales reales); menos bytes de JS para parsear en celulares viejos.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["warn", "error"] } : false,
  },
};

module.exports = nextConfig;

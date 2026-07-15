/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The `geist` package is ESM ("type": "module") and imports `next/font/local`
  // as a bare directory. Node's ESM resolver rejects directory imports, which
  // breaks `next build` at page-data collection. Routing it through webpack
  // fixes the resolution.
  transpilePackages: ["geist"],
};
module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/n',
  assetPrefix: '/n', // Optional but useful for static assets
  trailingSlash: true, // Optional: makes URLs like `/n/about/` (not `/n/about`)
  reactMaxHeadersLength: 60000,
};

export default nextConfig;

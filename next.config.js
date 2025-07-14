/** @type {import('next').NextConfig} */
const nextConfig = {
  // The 'eslint' and 'typescript' settings are generally not needed
  // unless you have a specific reason to override the defaults.
  // It's cleaner to remove them.
  
  // The 'images: { unoptimized: true }' is fine if you intend to not use Next.js Image Optimization.
  images: { unoptimized: true },
};

module.exports = nextConfig;

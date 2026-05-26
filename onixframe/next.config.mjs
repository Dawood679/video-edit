/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep native binaries out of the edge/client bundle
  serverExternalPackages: ['@prisma/client', 'fluent-ffmpeg', 'ffmpeg-static'],

  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'http', hostname: 'minio', port: '9000' },
      // EC2: runtime injection via EC2_PUBLIC_IP env var
      ...(process.env.EC2_PUBLIC_IP
        ? [{ protocol: 'http', hostname: process.env.EC2_PUBLIC_IP, port: '9000' }]
        : []),
    ],
  },
};

export default nextConfig;

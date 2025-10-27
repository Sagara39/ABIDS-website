
import type {NextConfig} from 'next';

const repo = 'nextn'

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Turbopack may infer the workspace root incorrectly when multiple lockfiles
  // exist on the system. Setting `turbopack.root` ensures static assets are
  // served from this project's directory.
  turbopack: {
    root: __dirname,
  },
  output: 'export',
  // During development we want the app served at `/` so `npm run dev` opens
  // the app directly (no 404). Use `basePath` and `assetPrefix` only in
  // production where the site is exported under `/${repo}`.
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

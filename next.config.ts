import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	experimental: {
		serverComponentsExternalPackages: ['sharp', 'canvas'],
	},
	images: {
		domains: ['firebasestorage.googleapis.com'],
	},
	webpack(config) {
		return config;
	},
};

// For Next.js App Router, we need to configure the middleware.ts file
// to handle the API route configuration

export default nextConfig;

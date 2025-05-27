import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	serverExternalPackages: ['sharp', 'canvas'],
	images: {
		domains: ['firebasestorage.googleapis.com'],
	},
	webpack(config) {
		return config;
	},
	// Add security headers configuration for Stripe
	async headers() {
		return [
			{
				// Apply these headers to all routes
				source: '/:path*',
				headers: [
					{
						key: 'Content-Security-Policy',
						value:
							"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stripe.com https://js.stripe.com; connect-src 'self' https://*.stripe.com; frame-src 'self' https://*.stripe.com; img-src 'self' data: https://*.stripe.com; style-src 'self' 'unsafe-inline';",
					},
				],
			},
		];
	},
};

// For Next.js App Router, we need to configure the middleware.ts file
// to handle the API route configuration

export default nextConfig;

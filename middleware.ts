import {clerkMiddleware} from '@clerk/nextjs/server';

// This middleware protects all routes by default
// See https://clerk.com/docs/references/nextjs/clerk-middleware for more information
export default clerkMiddleware();

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
};

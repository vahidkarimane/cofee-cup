'use client';

import {useAuth} from '@clerk/nextjs';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export default function ProtectedRoute({children}: ProtectedRouteProps) {
	const {isLoaded, userId} = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isLoaded && !userId) {
			router.push('/auth/sign-in');
		}
	}, [isLoaded, userId, router]);

	// Show loading state while checking authentication
	if (!isLoaded || !userId) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<div className="text-center">
					<div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}

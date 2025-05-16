import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
	return (
		<div className="min-h-screen bg-background">
			<main className="container py-6">
				<ProtectedRoute>{children}</ProtectedRoute>
			</main>
		</div>
	);
}

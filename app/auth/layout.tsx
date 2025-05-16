import React from 'react';
import Image from 'next/image';

export default function AuthLayout({children}: {children: React.ReactNode}) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="relative mx-auto h-12 w-48">
					<Image
						className="mx-auto"
						src="/light-logo.png"
						alt="Coffee Cup Fortune"
						fill
						style={{objectFit: 'contain'}}
						priority
					/>
				</div>
				<h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Coffee Cup Fortune</h2>
			</div>
			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10">{children}</div>
			</div>
		</div>
	);
}

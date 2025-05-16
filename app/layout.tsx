import type {Metadata} from 'next';
import {ClerkProvider} from '@clerk/nextjs';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Coffee Cup Fortune Telling',
	description: 'Discover your future through coffee cup fortune telling',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					<Navbar />
					<main>{children}</main>
				</body>
			</html>
		</ClerkProvider>
	);
}

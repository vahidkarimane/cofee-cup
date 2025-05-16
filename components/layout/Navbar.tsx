'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {SignInButton, SignUpButton, SignedIn, SignedOut, UserButton} from '@clerk/nextjs';
import {Menu, X} from 'lucide-react';

const navLinks = [
	{
		name: 'Home',
		href: '/',
	},
	{
		name: 'Get Fortune',
		href: '/fortune',
	},
	{
		name: 'Dashboard',
		href: '/dashboard',
		auth: true,
	},
	{
		name: 'How It Works',
		href: '/#how-it-works',
	},
	{
		name: 'Pricing',
		href: '/#pricing',
	},
];

export default function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setMobileMenuOpen(false);
	};

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === href;
		}
		return pathname.startsWith(href);
	};

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background">
			<div className="container flex h-16 items-center justify-between py-4">
				{/* Logo and App Name */}
				<div className="flex items-center gap-2">
					<Link href="/" className="flex items-center gap-2">
						<div className="relative h-8 w-8">
							<Image
								src="/light-logo.png"
								alt="Coffee Cup Fortune"
								fill
								style={{objectFit: 'contain'}}
								priority
							/>
						</div>
						<span className="hidden font-bold sm:inline-block">Coffee Cup Fortune</span>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex md:items-center md:gap-6">
					{navLinks.map((link) => (
						<React.Fragment key={link.name}>
							{link.auth ? (
								<SignedIn>
									<Link
										href={link.href}
										className={`text-sm font-medium transition-colors hover:text-primary ${
											isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
										}`}
									>
										{link.name}
									</Link>
								</SignedIn>
							) : (
								<Link
									href={link.href}
									className={`text-sm font-medium transition-colors hover:text-primary ${
										isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
									}`}
								>
									{link.name}
								</Link>
							)}
						</React.Fragment>
					))}
				</nav>

				{/* Auth Buttons */}
				<div className="flex items-center gap-4">
					<SignedOut>
						<div className="hidden sm:flex sm:items-center sm:gap-2">
							<SignInButton mode="modal">
								<button className="text-sm font-medium text-muted-foreground hover:text-primary">
									Sign In
								</button>
							</SignInButton>
							<SignUpButton mode="modal">
								<button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
									Sign Up
								</button>
							</SignUpButton>
						</div>
					</SignedOut>
					<SignedIn>
						<UserButton afterSignOutUrl="/" />
					</SignedIn>

					{/* Mobile Menu Button */}
					<button
						className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
						onClick={toggleMobileMenu}
						aria-label="Toggle menu"
					>
						{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="container md:hidden">
					<div className="flex flex-col space-y-4 py-4">
						{navLinks.map((link) => (
							<React.Fragment key={link.name}>
								{link.auth ? (
									<SignedIn>
										<Link
											href={link.href}
											className={`text-sm font-medium transition-colors hover:text-primary ${
												isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
											}`}
											onClick={closeMobileMenu}
										>
											{link.name}
										</Link>
									</SignedIn>
								) : (
									<Link
										href={link.href}
										className={`text-sm font-medium transition-colors hover:text-primary ${
											isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
										}`}
										onClick={closeMobileMenu}
									>
										{link.name}
									</Link>
								)}
							</React.Fragment>
						))}
						<SignedOut>
							<div className="flex flex-col space-y-2 pt-2">
								<SignInButton mode="modal">
									<button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
										Sign In
									</button>
								</SignInButton>
								<SignUpButton mode="modal">
									<button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
										Sign Up
									</button>
								</SignUpButton>
							</div>
						</SignedOut>
					</div>
				</div>
			)}
		</header>
	);
}

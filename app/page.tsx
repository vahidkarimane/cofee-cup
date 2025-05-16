import Image from 'next/image';
import Link from 'next/link';
import {SignedIn, SignedOut} from '@clerk/nextjs';

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col">
			<main className="flex-1">
				{/* Hero Section */}
				<section className="bg-background py-24">
					<div className="container mx-auto px-4">
						<div className="grid gap-8 md:grid-cols-2 md:gap-12">
							<div className="flex flex-col justify-center space-y-6">
								<div>
									<span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
										✨ AI-Powered Fortune Telling
									</span>
								</div>
								<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
									Discover Your Future in Coffee Grounds
								</h1>
								<p className="text-xl text-muted-foreground">
									Experience the ancient art of tasseography reimagined with cutting-edge AI. Upload
									a photo of your coffee cup and receive personalized insights into your future,
									relationships, and life path.
								</p>
								<div className="flex flex-col gap-4 sm:flex-row">
									<SignedIn>
										<Link
											href="/dashboard"
											className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										>
											Go to Dashboard
										</Link>
									</SignedIn>
									<SignedOut>
										<Link
											href="/auth/sign-up"
											className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										>
											Get Started
										</Link>
										<Link
											href="/auth/sign-in"
											className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										>
											Sign In
										</Link>
									</SignedOut>
								</div>
							</div>
							<div className="flex items-center justify-center">
								<Image
									src="/hero.png"
									alt="Coffee Cup Fortune"
									width={500}
									height={500}
									className="rounded-lg object-cover"
									priority
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section id="how-it-works" className="bg-muted py-24">
					<div className="container mx-auto px-4">
						<div className="mb-16 text-center">
							<h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
							<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
								Our innovative platform combines ancient divination techniques with modern AI to
								deliver accurate and insightful readings.
							</p>
						</div>
						<div className="grid gap-8 md:grid-cols-3">
							<div className="rounded-lg bg-card p-8 shadow-lg transition-all hover:shadow-xl">
								<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
									1
								</div>
								<h3 className="mb-3 text-2xl font-semibold">Upload Your Cup</h3>
								<p className="text-muted-foreground">
									Take a photo of your coffee cup after you've finished drinking, making sure the
									grounds are visible along the sides and bottom of the cup.
								</p>
							</div>
							<div className="rounded-lg bg-card p-8 shadow-lg transition-all hover:shadow-xl">
								<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
									2
								</div>
								<h3 className="mb-3 text-2xl font-semibold">AI Analysis</h3>
								<p className="text-muted-foreground">
									Our advanced AI powered by Claude 3.7 Sonnet analyzes the patterns in your coffee
									grounds using techniques refined from centuries of tasseography practice.
								</p>
							</div>
							<div className="rounded-lg bg-card p-8 shadow-lg transition-all hover:shadow-xl">
								<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
									3
								</div>
								<h3 className="mb-3 text-2xl font-semibold">Receive Your Fortune</h3>
								<p className="text-muted-foreground">
									Get a detailed fortune reading covering your future, relationships, career, and
									more, delivered instantly and also sent to your email for future reference.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Pricing Section */}
				<section id="pricing" className="bg-background py-24">
					<div className="container mx-auto px-4">
						<div className="mb-16 text-center">
							<h2 className="mb-4 text-3xl font-bold md:text-4xl">Simple, Transparent Pricing</h2>
							<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
								Choose the plan that works best for you and start discovering insights from your
								coffee cup.
							</p>
						</div>
						<div className="grid gap-8 md:grid-cols-3">
							<div className="rounded-lg border bg-card p-8 shadow-lg transition-all hover:shadow-xl">
								<div className="mb-4">
									<h3 className="text-2xl font-semibold">Single Reading</h3>
									<div className="mt-4 flex items-baseline">
										<span className="text-4xl font-bold">$4.99</span>
										<span className="ml-2 text-muted-foreground">/ reading</span>
									</div>
								</div>
								<ul className="mb-8 space-y-3">
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										One detailed fortune reading
									</li>
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Email delivery
									</li>
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										30-day access to reading
									</li>
								</ul>
								<SignedIn>
									<Link
										href="/dashboard"
										className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
									>
										Get Started
									</Link>
								</SignedIn>
								<SignedOut>
									<Link
										href="/auth/sign-up"
										className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
									>
										Get Started
									</Link>
								</SignedOut>
							</div>
							<div className="relative rounded-lg border-2 border-primary bg-card p-8 shadow-lg transition-all hover:shadow-xl">
								<div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
									Most Popular
								</div>
								<div className="mb-4">
									<h3 className="text-2xl font-semibold">Monthly</h3>
									<div className="mt-4 flex items-baseline">
										<span className="text-4xl font-bold">$9.99</span>
										<span className="ml-2 text-muted-foreground">/ month</span>
									</div>
								</div>
								<ul className="mb-8 space-y-3">
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										3 readings per month
									</li>
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Email delivery
									</li>
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Unlimited access to readings
									</li>
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Reading history
									</li>
								</ul>
								<SignedIn>
									<Link
										href="/dashboard"
										className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
									>
										Get Started
									</Link>
								</SignedIn>
								<SignedOut>
									<Link
										href="/auth/sign-up"
										className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
									>
										Get Started
									</Link>
								</SignedOut>
							</div>
							<div className="rounded-lg border bg-card p-8 shadow-lg transition-all hover:shadow-xl">
								<div className="mb-4">
									<h3 className="text-2xl font-semibold">Annual</h3>
									<div className="mt-4 flex items-baseline">
										<span className="text-4xl font-bold">$89.99</span>
										<span className="ml-2 text-muted-foreground">/ year</span>
									</div>
								</div>
								<ul className="mb-8 space-y-3">
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										5 readings per month (60/year)
									</li>
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Email delivery
									</li>
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Unlimited access to readings
									</li>
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Reading history
									</li>
									<li className="flex items-center">
										<svg
											className="mr-2 h-5 w-5 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
										Priority support
									</li>
								</ul>
								<SignedIn>
									<Link
										href="/dashboard"
										className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
									>
										Get Started
									</Link>
								</SignedIn>
								<SignedOut>
									<Link
										href="/auth/sign-up"
										className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
									>
										Get Started
									</Link>
								</SignedOut>
							</div>
						</div>
					</div>
				</section>

				{/* Testimonials Section */}
				<section className="bg-muted py-24">
					<div className="container mx-auto px-4">
						<div className="mb-16 text-center">
							<h2 className="mb-4 text-3xl font-bold md:text-4xl">What Our Users Say</h2>
							<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
								Discover how Coffee Cup Fortune has helped people gain insights into their lives.
							</p>
						</div>
						<div className="grid gap-8 md:grid-cols-3">
							<div className="rounded-lg bg-card p-8 shadow-lg">
								<div className="mb-4 flex">
									{[1, 2, 3, 4, 5].map((star) => (
										<svg
											key={star}
											className="h-5 w-5 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
										</svg>
									))}
								</div>
								<p className="mb-4 italic text-muted-foreground">
									"I was skeptical at first, but the reading was surprisingly accurate. It gave me
									insights about my career that helped me make an important decision."
								</p>
								<div className="flex items-center">
									<div className="mr-4 h-10 w-10 rounded-full bg-primary/20"></div>
									<div>
										<p className="font-medium">Sarah Johnson</p>
										<p className="text-sm text-muted-foreground">Marketing Director</p>
									</div>
								</div>
							</div>
							<div className="rounded-lg bg-card p-8 shadow-lg">
								<div className="mb-4 flex">
									{[1, 2, 3, 4, 5].map((star) => (
										<svg
											key={star}
											className="h-5 w-5 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
										</svg>
									))}
								</div>
								<p className="mb-4 italic text-muted-foreground">
									"I use Coffee Cup Fortune monthly and it's become a fun ritual. The readings are
									always thought-provoking and give me a new perspective on things."
								</p>
								<div className="flex items-center">
									<div className="mr-4 h-10 w-10 rounded-full bg-primary/20"></div>
									<div>
										<p className="font-medium">Michael Chen</p>
										<p className="text-sm text-muted-foreground">Software Engineer</p>
									</div>
								</div>
							</div>
							<div className="rounded-lg bg-card p-8 shadow-lg">
								<div className="mb-4 flex">
									{[1, 2, 3, 4, 5].map((star) => (
										<svg
											key={star}
											className="h-5 w-5 text-yellow-400"
											fill="currentColor"
											viewBox="0 0 20 20"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
										</svg>
									))}
								</div>
								<p className="mb-4 italic text-muted-foreground">
									"The annual subscription is worth every penny. I love how detailed the readings
									are, and they've been surprisingly accurate about my relationships."
								</p>
								<div className="flex items-center">
									<div className="mr-4 h-10 w-10 rounded-full bg-primary/20"></div>
									<div>
										<p className="font-medium">Emma Rodriguez</p>
										<p className="text-sm text-muted-foreground">Therapist</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="bg-background py-24">
					<div className="container mx-auto px-4">
						<div className="mb-16 text-center">
							<h2 className="mb-4 text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
							<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
								Find answers to common questions about Coffee Cup Fortune.
							</p>
						</div>
						<div className="mx-auto max-w-3xl space-y-6">
							<div className="rounded-lg border bg-card p-6">
								<h3 className="mb-3 text-xl font-semibold">How accurate are the readings?</h3>
								<p className="text-muted-foreground">
									Our AI is trained on centuries of tasseography practices and patterns. While no
									fortune telling method is 100% accurate, many users report meaningful insights and
									surprising accuracy in their readings.
								</p>
							</div>
							<div className="rounded-lg border bg-card p-6">
								<h3 className="mb-3 text-xl font-semibold">What kind of coffee should I use?</h3>
								<p className="text-muted-foreground">
									Turkish coffee or any finely ground coffee works best as it leaves more distinct
									patterns. However, our AI can analyze patterns from any type of coffee grounds.
								</p>
							</div>
							<div className="rounded-lg border bg-card p-6">
								<h3 className="mb-3 text-xl font-semibold">
									How do I take a good photo of my cup?
								</h3>
								<p className="text-muted-foreground">
									Ensure good lighting, focus on the inside of the cup, and try to capture all the
									patterns along the sides and bottom. We provide detailed instructions in the app.
								</p>
							</div>
							<div className="rounded-lg border bg-card p-6">
								<h3 className="mb-3 text-xl font-semibold">
									Can I cancel my subscription anytime?
								</h3>
								<p className="text-muted-foreground">
									Yes, you can cancel your subscription at any time from your account settings.
									You'll continue to have access until the end of your billing period.
								</p>
							</div>
							<div className="rounded-lg border bg-card p-6">
								<h3 className="mb-3 text-xl font-semibold">How soon will I receive my reading?</h3>
								<p className="text-muted-foreground">
									Readings are typically generated within minutes and displayed immediately in the
									app. You'll also receive an email with your reading for future reference.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="bg-primary py-16 text-primary-foreground">
					<div className="container mx-auto px-4">
						<div className="flex flex-col items-center justify-between gap-8 md:flex-row">
							<div>
								<h2 className="mb-2 text-3xl font-bold">Ready to discover your future?</h2>
								<p className="text-lg">
									Get your first reading today and unlock insights from your coffee cup.
								</p>
							</div>
							<div>
								<SignedIn>
									<Link
										href="/dashboard"
										className="inline-flex h-12 items-center justify-center rounded-md bg-background px-8 text-base font-medium text-primary hover:bg-background/90"
									>
										Go to Dashboard
									</Link>
								</SignedIn>
								<SignedOut>
									<Link
										href="/auth/sign-up"
										className="inline-flex h-12 items-center justify-center rounded-md bg-background px-8 text-base font-medium text-primary hover:bg-background/90"
									>
										Get Started
									</Link>
								</SignedOut>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t bg-background py-12">
				<div className="container mx-auto px-4">
					<div className="grid gap-8 md:grid-cols-4">
						<div>
							<div className="flex items-center gap-2">
								<Image
									src="/light-logo.png"
									alt="Coffee Cup Fortune"
									width={32}
									height={32}
									className="h-8 w-auto"
								/>
								<span className="text-lg font-medium">Coffee Cup Fortune</span>
							</div>
							<p className="mt-4 text-sm text-muted-foreground">
								Discover insights from your coffee cup with our AI-powered fortune telling service.
							</p>
						</div>
						<div>
							<h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Product</h3>
							<ul className="space-y-2">
								<li>
									<Link
										href="/#how-it-works"
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										How It Works
									</Link>
								</li>
								<li>
									<Link
										href="/#pricing"
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										Pricing
									</Link>
								</li>
								<li>
									<Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
										Features
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Support</h3>
							<ul className="space-y-2">
								<li>
									<Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
										Help Center
									</Link>
								</li>
								<li>
									<Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
										Contact Us
									</Link>
								</li>
								<li>
									<Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
										Privacy Policy
									</Link>
								</li>
								<li>
									<Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
										Terms of Service
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Connect</h3>
							<div className="flex space-x-4">
								<Link href="#" className="text-muted-foreground hover:text-foreground">
									<span className="sr-only">Twitter</span>
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
									</svg>
								</Link>
								<Link href="#" className="text-muted-foreground hover:text-foreground">
									<span className="sr-only">Twitter</span>
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
									</svg>
								</Link>
								<Link href="#" className="text-muted-foreground hover:text-foreground">
									<span className="sr-only">Instagram</span>
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
											clipRule="evenodd"
										/>
									</svg>
								</Link>
								<Link href="#" className="text-muted-foreground hover:text-foreground">
									<span className="sr-only">Facebook</span>
									<svg
										className="h-6 w-6"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
											clipRule="evenodd"
										/>
									</svg>
								</Link>
							</div>
						</div>
					</div>
					<div className="mt-8 border-t pt-8 text-center">
						<p className="text-sm text-muted-foreground">
							&copy; {new Date().getFullYear()} Coffee Cup Fortune. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

import React from 'react';
import FortuneForm from '@/components/fortune/FortuneForm';

export const metadata = {
	title: 'Get Your Fortune | Coffee Cup Fortune',
	description: 'Upload your coffee cup image and receive a personalized fortune reading.',
};

export default function FortunePage() {
	return (
		<div className="container py-12">
			<div className="mx-auto max-w-4xl space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Get Your Fortune</h1>
					<p className="mt-4 text-lg text-muted-foreground">
						Upload a photo of your coffee cup and our AI will analyze the patterns to reveal your
						fortune.
					</p>
				</div>

				<div className="mt-10">
					<FortuneForm />
				</div>

				<div className="mt-16 space-y-8">
					<div className="rounded-lg border bg-card p-6">
						<h2 className="text-2xl font-semibold">How to Take a Good Photo</h2>
						<div className="mt-4 grid gap-6 md:grid-cols-3">
							<div className="space-y-2">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
									1
								</div>
								<h3 className="font-medium">Finish Your Coffee</h3>
								<p className="text-sm text-muted-foreground">
									Drink your coffee completely, leaving only the grounds at the bottom and sides of
									the cup.
								</p>
							</div>
							<div className="space-y-2">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
									2
								</div>
								<h3 className="font-medium">Swirl and Flip</h3>
								<p className="text-sm text-muted-foreground">
									Gently swirl the remaining liquid, then flip the cup upside down on a saucer for a
									minute to let excess liquid drain.
								</p>
							</div>
							<div className="space-y-2">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
									3
								</div>
								<h3 className="font-medium">Take a Clear Photo</h3>
								<p className="text-sm text-muted-foreground">
									In good lighting, take a clear photo of the inside of the cup, capturing all the
									patterns formed by the grounds.
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-lg border bg-card p-6">
						<h2 className="text-2xl font-semibold">About Coffee Cup Fortune Telling</h2>
						<p className="mt-4 text-muted-foreground">
							Tasseography, or coffee cup reading, is an ancient divination practice that interprets
							patterns formed by coffee grounds. Originating in the Middle East and Greece, this
							tradition has been used for centuries to gain insights into the past, present, and
							future. Our AI combines this ancient art with modern technology to provide you with
							personalized readings.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

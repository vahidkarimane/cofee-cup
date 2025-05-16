import {SignIn} from '@clerk/nextjs';

export default function SignInPage() {
	return (
		<div className="flex justify-center">
			<SignIn
				appearance={{
					elements: {
						formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
						footerActionLink: 'text-primary hover:text-primary/90',
					},
				}}
				redirectUrl="/dashboard"
			/>
		</div>
	);
}

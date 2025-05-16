import {SignUp} from '@clerk/nextjs';

export default function SignUpPage() {
	return (
		<div className="flex justify-center">
			<SignUp
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

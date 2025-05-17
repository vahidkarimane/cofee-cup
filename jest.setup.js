// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the next/router
jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		prefetch: jest.fn(),
		back: jest.fn(),
		pathname: '/',
		query: {},
	}),
	usePathname: () => '/',
	useSearchParams: () => new URLSearchParams(),
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
	auth: () => ({
		userId: 'test-user-id',
		getToken: jest.fn(() => 'test-token'),
	}),
	currentUser: () => ({
		id: 'test-user-id',
		firstName: 'Test',
		lastName: 'User',
		emailAddresses: [{emailAddress: 'test@example.com'}],
		imageUrl: 'https://example.com/image.jpg',
	}),
	useAuth: () => ({
		isLoaded: true,
		isSignedIn: true,
		userId: 'test-user-id',
	}),
	useUser: () => ({
		isLoaded: true,
		isSignedIn: true,
		user: {
			id: 'test-user-id',
			firstName: 'Test',
			lastName: 'User',
			emailAddresses: [{emailAddress: 'test@example.com'}],
			imageUrl: 'https://example.com/image.jpg',
		},
	}),
	ClerkProvider: ({children}) => children,
	SignIn: () => <div>Sign In</div>,
	SignUp: () => <div>Sign Up</div>,
}));

// Mock Firebase
jest.mock('@/lib/firebase/config', () => ({
	db: {
		collection: jest.fn(() => ({
			doc: jest.fn(() => ({
				get: jest.fn(() =>
					Promise.resolve({
						exists: true,
						data: () => ({}),
						id: 'test-doc-id',
					})
				),
				set: jest.fn(() => Promise.resolve()),
				update: jest.fn(() => Promise.resolve()),
				delete: jest.fn(() => Promise.resolve()),
			})),
			add: jest.fn(() => Promise.resolve({id: 'test-doc-id'})),
			where: jest.fn(() => ({
				get: jest.fn(() =>
					Promise.resolve({
						docs: [],
						empty: true,
					})
				),
			})),
		})),
	},
	storage: {
		ref: jest.fn(() => ({
			put: jest.fn(() =>
				Promise.resolve({
					ref: {
						getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/image.jpg')),
					},
				})
			),
			getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/image.jpg')),
		})),
	},
}));

// Mock AWS Bedrock
jest.mock('@/services/bedrock', () => ({
	generateFortunePrediction: jest.fn(() => Promise.resolve('Your fortune is bright!')),
}));

// Mock Stripe
jest.mock('@/services/stripe', () => ({
	createPaymentIntent: jest.fn(() =>
		Promise.resolve({
			clientSecret: 'test-client-secret',
			id: 'test-payment-intent-id',
		})
	),
}));

// Mock Email Service
jest.mock('@/services/email', () => ({
	sendFortuneEmail: jest.fn(() => Promise.resolve({id: 'test-email-id'})),
	sendWelcomeEmail: jest.fn(() => Promise.resolve({id: 'test-email-id'})),
}));

// Mock global fetch
global.fetch = jest.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({}),
		text: () => Promise.resolve(''),
	})
);

/**
 * Environment variable validation and loading
 */

// Function to validate that required environment variables are set
const validateEnv = (key: string, required: boolean = true): string => {
	const value = process.env[key];
	if (!value && required) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value || '';
};

// Clerk Authentication (optional for development)
export const CLERK_PUBLISHABLE_KEY = validateEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', false);
export const CLERK_SECRET_KEY = validateEnv('CLERK_SECRET_KEY', false);

// Firebase Configuration (only validate when Firebase is being used)
export const getFirebaseConfig = () => ({
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

// Stripe Configuration (only validate when Stripe is being used)
export const getStripeConfig = () => ({
	publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
	secretKey: process.env.STRIPE_SECRET_KEY,
	webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
	priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
});

// AWS Bedrock Configuration (only validate when AWS Bedrock is being used)
export const getAwsBedrockConfig = () => ({
	region: process.env.AWS_REGION || 'us-east-1',
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	modelId: process.env.AWS_BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
});

// OpenAI Configuration (only validate when OpenAI is being used)
export const getOpenAIConfig = () => ({
	apiKey: process.env.OPENAI_API_KEY,
	model: process.env.OPENAI_MODEL || 'gpt-4.1',
});

// Email Service Configuration (only validate when email service is being used)
export const getEmailConfig = () => ({
	apiKey: process.env.RESEND_API_KEY,
	fromAddress: process.env.EMAIL_FROM_ADDRESS || 'fortune@coffeecupfortune.com',
});

// App Configuration
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

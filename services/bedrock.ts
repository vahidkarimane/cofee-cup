'use server';

import {
	BedrockRuntimeClient,
	InvokeModelCommand,
	InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';
import {getAwsBedrockConfig} from '@/lib/env';

// Initialize AWS Bedrock client
const bedrockConfig = getAwsBedrockConfig();
const bedrockClient = new BedrockRuntimeClient({
	region: bedrockConfig.region,
	credentials: {
		accessKeyId: bedrockConfig.accessKeyId || '',
		secretAccessKey: bedrockConfig.secretAccessKey || '',
	},
});

// Model ID for Claude 3.7 Sonnet
const MODEL_ID = bedrockConfig.modelId;

/**
 * Generate a fortune prediction based on a coffee cup image
 * @param imageUrl URL of the coffee cup image
 * @param notes Additional notes from the user
 * @returns The generated fortune prediction
 */
export async function generateFortunePrediction(imageUrl: string, notes?: string): Promise<string> {
	try {
		// Fetch the image as base64
		const imageBase64 = await fetchImageAsBase64(imageUrl);

		// Create the prompt for Claude
		const prompt = createPrompt(imageBase64, notes);

		// Invoke the model
		const command = new InvokeModelCommand({
			modelId: MODEL_ID,
			contentType: 'application/json',
			accept: 'application/json',
			body: JSON.stringify({
				anthropic_version: 'bedrock-2023-05-31',
				max_tokens: 1000,
				temperature: 0.7,
				messages: [
					{
						role: 'user',
						content: [
							{
								type: 'image',
								source: {
									type: 'base64',
									media_type: 'image/jpeg',
									data: imageBase64,
								},
							},
							{
								type: 'text',
								text: prompt,
							},
						],
					},
				],
			}),
		});

		const response = await bedrockClient.send(command);
		const responseBody = JSON.parse(new TextDecoder().decode(response.body));

		return responseBody.content[0].text;
	} catch (error) {
		console.error('Error generating fortune prediction:', error);
		throw new Error('Failed to generate fortune prediction');
	}
}

/**
 * Create a prompt for Claude to generate a fortune prediction
 * @param imageBase64 Base64-encoded image
 * @param notes Additional notes from the user
 * @returns The prompt for Claude
 */
function createPrompt(imageBase64: string, notes?: string): string {
	return `
You are a skilled tasseographer (coffee cup fortune teller) with decades of experience reading coffee grounds. 
I've provided an image of coffee grounds in a cup. Please analyze the patterns and provide a detailed, personalized fortune reading.

Your reading should include:
1. An overall interpretation of the patterns
2. Insights about the person's current situation
3. Predictions for their near future
4. Guidance or advice based on what you see

${notes ? `The person has provided these additional notes or questions: "${notes}"` : ''}

Please make your reading detailed, insightful, and personalized. Use the specific patterns you see in the coffee grounds to inform your reading.
Respond in a mystical, wise tone that befits a fortune teller, but remain grounded and thoughtful.

Your reading should be 3-4 paragraphs long.
`;
}

/**
 * Fetch an image from a URL and convert it to base64
 * @param imageUrl URL of the image
 * @returns Base64-encoded image
 */
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
	try {
		const response = await fetch(imageUrl);
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		return buffer.toString('base64');
	} catch (error) {
		console.error('Error fetching image:', error);
		throw new Error('Failed to fetch image');
	}
}

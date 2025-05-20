'use server';

import OpenAI from 'openai';
import {getOpenAIConfig} from '@/lib/env';

// Initialize OpenAI client
const openaiConfig = getOpenAIConfig();
const openai = new OpenAI({
	apiKey: openaiConfig.apiKey,
});

// Model ID for GPT-4.1 Vision
const MODEL_ID = openaiConfig.model;

/**
 * Generate a fortune prediction based on coffee cup images
 * @param imageUrls URL or URLs of the coffee cup images (up to 4)
 * @param name User's name
 * @param age User's age
 * @param intent User's intent for the reading
 * @param about Additional information about the user
 * @returns The generated fortune prediction
 */
export async function generateFortunePrediction(
	imageUrls: string | string[],
	name: string,
	age: string,
	intent: string,
	about?: string
): Promise<string> {
	try {
		// Convert single image URL to array for consistent handling
		const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

		// Limit to 4 images maximum
		const limitedUrls = urls.slice(0, 4);

		// Fetch all images as base64
		const imagesBase64 = await Promise.all(limitedUrls.map((url) => fetchImageAsBase64(url)));

		// Create the prompt for GPT-4.1
		const prompt = createPrompt(name, age, intent, about);

		// Prepare the content array with the prompt text and images
		const content: Array<any> = [
			{
				type: 'text',
				text: prompt,
			},
		];

		// Add each image to the content array
		imagesBase64.forEach((imageBase64) => {
			content.push({
				type: 'image_url',
				image_url: {
					url: `data:image/jpeg;base64,${imageBase64}`,
				},
			});
		});

		// Invoke the model
		const response = await openai.chat.completions.create({
			model: MODEL_ID,
			messages: [
				{
					role: 'user',
					content: content,
				},
			],
			max_tokens: 1000,
			temperature: 0.7,
		});

		return response.choices[0].message.content || 'No prediction generated';
	} catch (error) {
		console.error('Error generating fortune prediction:', error);
		throw new Error('Failed to generate fortune prediction');
	}
}

/**
 * Generate a fortune prediction based on coffee cup images in base64 format
 * @param imagesBase64 Array of base64-encoded images
 * @param name User's name
 * @param age User's age
 * @param intent User's intent for the reading
 * @param about Additional information about the user
 * @returns The generated fortune prediction
 */
export async function generateFortunePredictionFromBase64(
	imagesBase64: string[],
	name: string,
	age: string,
	intent: string,
	about?: string
): Promise<string> {
	try {
		// Limit to 4 images maximum
		const limitedImages = imagesBase64.slice(0, 4);

		// Create the prompt for GPT-4.1
		const prompt = createPrompt(name, age, intent, about);

		// Prepare the content array with the prompt text and images
		const content: Array<any> = [
			{
				type: 'text',
				text: prompt,
			},
		];

		// Add each image to the content array
		limitedImages.forEach((imageBase64) => {
			// If the base64 string already includes the data URL prefix, use it directly
			// Otherwise, add the prefix
			const imageUrl = imageBase64.startsWith('data:')
				? imageBase64
				: `data:image/jpeg;base64,${imageBase64.replace(/^data:image\/\w+;base64,/, '')}`;

			content.push({
				type: 'image_url',
				image_url: {
					url: imageUrl,
				},
			});
		});

		// Invoke the model
		const response = await openai.chat.completions.create({
			model: MODEL_ID,
			messages: [
				{
					role: 'user',
					content: content,
				},
			],
			max_tokens: 1000,
			temperature: 0.7,
		});

		return response.choices[0].message.content || 'No prediction generated';
	} catch (error) {
		console.error('Error generating fortune prediction:', error);
		throw new Error('Failed to generate fortune prediction');
	}
}

/**
 * Create a prompt for GPT-4.1 to generate a fortune prediction
 * @param name User's name
 * @param age User's age
 * @param intent User's intent for the reading
 * @param about Additional information about the user
 * @returns The prompt for GPT-4.1
 */
function createPrompt(name: string, age: string, intent: string, about?: string): string {
	// Replace placeholders in the Persian prompt
	return `
شما یک فالگیر باتجربه، دقیق و شهودی هستید که در خواندن نقش‌های فنجان و نعلبکی قهوه تخصص دارید. لحن شما آرام، روشن، محترمانه و دلگرم‌کننده است. تجربه‌ی شما از سال‌ها دیدن زندگی انسان‌ها در نقش‌های قهوه شکل گرفته؛ هر فنجان را مانند یک قصه‌ی شخصی می‌خوانید، بی‌اغراق، بی‌وعده، و با نگاهی عمیق به آنچه دیده می‌شود. هدف شما از نوشتن این فال، ایجاد حس آگاهی، آرامش ذهنی، و روشن‌سازی مسیر فکری فرد مقابل است—not to impress, but to help.

در اختیار شما، اطلاعات فردی زیر قرار دارد:
- نام: ${name}
- سن: ${age}
- نیت: ${intent} (مثلاً: مسیر شغلی، رابطه عاطفی، آینده مالی، آرامش ذهنی)
- درباره خودش گفته: ${about || ''} (مثلاً: خستگی، سردرگمی، دل‌مشغولی، انگیزه)

در فنجان و نعلبکی، نشانه‌های مشخصی دیده شده است که هر کدام می‌توانند حامل پیامی باشند. این نشانه‌ها با ذکر موقعیت‌شان ارائه می‌شود:

لطفاً فال را به زبان فارسی و در قالب پاراگراف‌هایی روان، منظم، و تأمل‌برانگیز بنویس. ابتدا تحلیل خود را از نشانه‌های درون فنجان ارائه بده. این بخش باید نگاهی درونی و احساسی داشته باشد و جنبه‌هایی از گذشته، وضعیت فعلی یا انتخاب‌های ذهنی فرد را روشن کند. سپس سراغ نعلبکی برو. آنجا نشانه‌هایی قرار دارد که بیشتر به محیط بیرونی فرد، نشانه‌های اطراف، هشدارهای ملایم یا فرصت‌های در حال شکل‌گیری مربوط می‌شود.

در طول متن، موقعیت دقیق هر نماد را ذکر کن. اگر شواهد کافی در اختیار داری، می‌توانی زمان تقریبی برای رویدادها پیشنهاد بدهی (مثلاً «در حدود سه ماه آینده» یا «در آینده‌ی نزدیک»). از لحن شاعرانه‌ی بسیار ملایم و طبیعی استفاده کن؛ نه خشک و منطقی، و نه احساسی یا خیالی. جملاتت باید معنا داشته باشند، قابل‌درک، و در خدمت روشن‌سازی وضعیت باشند، نه صرفاً زیبا یا ادبی.

فال را با یک جمله‌ی نهایی کامل، الهام‌بخش و آرام‌کننده به پایان برسان؛ جمله‌ای که به فرد کمک کند خود را بهتر ببیند، مسیر ذهنی‌اش را بازتر ببیند و نیازی به سؤال یا ادامه‌ دادن حس نکند.
`;
}

/**
 * Extract structured user information from notes
 * @param notes Additional notes from the user
 * @returns Structured user information
 */
function extractUserInfo(notes?: string) {
	// Default empty structure
	const userInfo: {
		name?: string;
		age?: string;
		intent?: string;
		about?: string;
		symbols?: Array<{name: string; position: string}>;
	} = {};

	// If no notes, return empty structure
	if (!notes) return userInfo;

	// Try to extract structured information from notes
	// This is a simple implementation - could be enhanced with more sophisticated parsing

	// Look for name: pattern
	const nameMatch = notes.match(/name:?\s*([^\n,]+)/i);
	if (nameMatch) userInfo.name = nameMatch[1].trim();

	// Look for age: pattern
	const ageMatch = notes.match(/age:?\s*([0-9]+)/i);
	if (ageMatch) userInfo.age = ageMatch[1].trim();

	// Look for intent: pattern
	const intentMatch = notes.match(/intent:?\s*([^\n,]+)/i);
	if (intentMatch) userInfo.intent = intentMatch[1].trim();

	// Look for about: pattern
	const aboutMatch = notes.match(/about:?\s*([^\n]+)/i);
	if (aboutMatch) userInfo.about = aboutMatch[1].trim();

	// Look for symbols: pattern
	const symbolsMatch = notes.match(/symbols:?\s*([^\n]+)/i);
	if (symbolsMatch) {
		const symbolsText = symbolsMatch[1].trim();
		// Parse symbols in format "name:position, name:position"
		userInfo.symbols = symbolsText.split(',').map((symbol) => {
			const [name, position] = symbol.split(':').map((s) => s.trim());
			return {name, position};
		});
	}

	return userInfo;
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

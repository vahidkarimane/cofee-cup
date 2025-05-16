'use server';

import {Resend} from 'resend';
import {getEmailConfig} from '@/lib/env';
import {Fortune} from '@/types';

// Initialize Resend with the API key
const emailConfig = getEmailConfig();
const resend = new Resend(emailConfig.apiKey);

/**
 * Send a fortune reading email to a user
 * @param email User's email address
 * @param fortune Fortune data
 * @returns The email ID if successful
 */
export async function sendFortuneEmail(email: string, fortune: Fortune): Promise<string> {
	try {
		const {data, error} = await resend.emails.send({
			from: emailConfig.fromAddress,
			to: email,
			subject: 'Your Coffee Cup Fortune Reading',
			html: createFortuneEmailHtml(fortune),
		});

		if (error) {
			console.error('Error sending email:', error);
			throw new Error('Failed to send email');
		}

		return data?.id || '';
	} catch (error) {
		console.error('Error sending fortune email:', error);
		throw new Error('Failed to send fortune email');
	}
}

/**
 * Create HTML content for the fortune email
 * @param fortune Fortune data
 * @returns HTML content for the email
 */
function createFortuneEmailHtml(fortune: Fortune): string {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Coffee Cup Fortune</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      max-width: 150px;
    }
    .fortune-image {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 8px;
      margin: 20px 0;
    }
    .fortune-text {
      background-color: #f9f9f9;
      border-left: 4px solid #6366f1;
      padding: 15px;
      margin: 20px 0;
      font-style: italic;
    }
    .cta-button {
      display: inline-block;
      background-color: #6366f1;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://coffeecupfortune.com/logo.png" alt="Coffee Cup Fortune" class="logo">
    <h1>Your Coffee Cup Fortune</h1>
  </div>
  
  <p>Thank you for using Coffee Cup Fortune! Here is your personalized fortune reading based on the patterns in your coffee cup:</p>
  
  <img src="${fortune.imageUrl}" alt="Your Coffee Cup" class="fortune-image">
  
  <div class="fortune-text">
    <p>${fortune.prediction}</p>
  </div>
  
  <p>We hope you enjoyed your reading! If you'd like to get another fortune reading, click the button below:</p>
  
  <a href="https://coffeecupfortune.com/fortune" class="cta-button">Get Another Reading</a>
  
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Coffee Cup Fortune. All rights reserved.</p>
    <p>If you no longer wish to receive these emails, you can <a href="https://coffeecupfortune.com/unsubscribe">unsubscribe here</a>.</p>
  </div>
</body>
</html>
`;
}

/**
 * Send a welcome email to a new user
 * @param email User's email address
 * @param name User's name
 * @returns The email ID if successful
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<string> {
	try {
		const {data, error} = await resend.emails.send({
			from: emailConfig.fromAddress,
			to: email,
			subject: 'Welcome to Coffee Cup Fortune!',
			html: createWelcomeEmailHtml(name),
		});

		if (error) {
			console.error('Error sending welcome email:', error);
			throw new Error('Failed to send welcome email');
		}

		return data?.id || '';
	} catch (error) {
		console.error('Error sending welcome email:', error);
		throw new Error('Failed to send welcome email');
	}
}

/**
 * Create HTML content for the welcome email
 * @param name User's name
 * @returns HTML content for the email
 */
function createWelcomeEmailHtml(name: string): string {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Coffee Cup Fortune</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      max-width: 150px;
    }
    .welcome-image {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 8px;
      margin: 20px 0;
    }
    .steps {
      margin: 30px 0;
    }
    .step {
      margin-bottom: 15px;
    }
    .step-number {
      display: inline-block;
      width: 30px;
      height: 30px;
      background-color: #6366f1;
      color: white;
      text-align: center;
      line-height: 30px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .cta-button {
      display: inline-block;
      background-color: #6366f1;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://coffeecupfortune.com/logo.png" alt="Coffee Cup Fortune" class="logo">
    <h1>Welcome to Coffee Cup Fortune!</h1>
  </div>
  
  <p>Hello${name ? ` ${name}` : ''},</p>
  
  <p>Thank you for joining Coffee Cup Fortune! We're excited to help you discover what your coffee cup reveals about your future.</p>
  
  <img src="https://coffeecupfortune.com/welcome.jpg" alt="Coffee Cup Fortune" class="welcome-image">
  
  <div class="steps">
    <h2>How to Get Your First Reading:</h2>
    
    <div class="step">
      <span class="step-number">1</span>
      <span>Finish your coffee, leaving only the grounds.</span>
    </div>
    
    <div class="step">
      <span class="step-number">2</span>
      <span>Swirl the cup and flip it upside down on a saucer for a minute.</span>
    </div>
    
    <div class="step">
      <span class="step-number">3</span>
      <span>Take a clear photo of the patterns formed by the grounds.</span>
    </div>
    
    <div class="step">
      <span class="step-number">4</span>
      <span>Upload your photo and receive your personalized fortune!</span>
    </div>
  </div>
  
  <p>Ready to discover what your coffee cup reveals?</p>
  
  <a href="https://coffeecupfortune.com/fortune" class="cta-button">Get Your First Reading</a>
  
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Coffee Cup Fortune. All rights reserved.</p>
    <p>If you no longer wish to receive these emails, you can <a href="https://coffeecupfortune.com/unsubscribe">unsubscribe here</a>.</p>
  </div>
</body>
</html>
`;
}

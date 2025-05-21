// Script to create the Supabase storage bucket
require('dotenv').config({path: '.env.local'});
const {createClient} = require('@supabase/supabase-js');

async function createStorageBucket() {
	try {
		console.log('Checking Supabase storage bucket...');

		// Check if keys are set
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl) {
			console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
			return;
		}

		if (!supabaseServiceKey) {
			console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
			return;
		}

		// Initialize Supabase client with service role key for admin operations
		console.log('Initializing Supabase client with service role key...');
		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		const bucketName = 'coffee-cup';

		// Check if bucket exists
		console.log(`Checking if bucket '${bucketName}' exists...`);
		const {data: bucketData, error: bucketError} = await supabase.storage.getBucket(bucketName);

		if (bucketError && bucketError.message.includes('not found')) {
			console.log(`Bucket '${bucketName}' does not exist. Creating...`);

			// Create the bucket
			const {data, error} = await supabase.storage.createBucket(bucketName, {
				public: true,
				fileSizeLimit: 10485760, // 10MB
			});

			if (error) {
				console.error('❌ Error creating bucket:', error.message);
			} else {
				console.log(`✅ Bucket '${bucketName}' created successfully!`);
			}
		} else if (bucketError) {
			console.error('❌ Error checking bucket:', bucketError.message);
		} else {
			console.log(`✅ Bucket '${bucketName}' already exists.`);
		}

		// Verify bucket exists and is public
		const {data: verifyData, error: verifyError} = await supabase.storage.getBucket(bucketName);

		if (verifyError) {
			console.error('❌ Error verifying bucket:', verifyError.message);
		} else {
			console.log('Bucket details:', verifyData);

			// Update bucket to be public if it's not
			if (!verifyData.public) {
				console.log('Setting bucket to public...');
				const {data: updateData, error: updateError} = await supabase.storage.updateBucket(
					bucketName,
					{
						public: true,
					}
				);

				if (updateError) {
					console.error('❌ Error updating bucket:', updateError.message);
				} else {
					console.log('✅ Bucket updated to be public');
				}
			}
		}
	} catch (error) {
		console.error('❌ Supabase bucket creation failed:', error.message);
	}
}

createStorageBucket();

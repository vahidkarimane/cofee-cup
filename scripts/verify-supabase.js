// Script to verify Supabase connection and tables
require('dotenv').config({path: '.env.local'});
const {createClient} = require('@supabase/supabase-js');

async function verifySupabase() {
	try {
		console.log('Verifying Supabase configuration...');

		// Check if keys are set
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl) {
			console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
			return;
		}

		if (!supabaseAnonKey) {
			console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
			return;
		}

		console.log('✅ Supabase configuration is set in environment variables');
		console.log(`URL: ${supabaseUrl}`);
		console.log(`Anon Key: ${supabaseAnonKey.substring(0, 15)}...`);

		// Initialize Supabase client
		console.log('Initializing Supabase client...');
		const supabase = createClient(supabaseUrl, supabaseAnonKey);

		// Test connection with a simple query
		console.log('Testing connection...');
		const {data: tableData, error: tableError} = await supabase
			.from('fortunes')
			.select('*')
			.limit(1);

		if (tableError) {
			if (tableError.code === 'PGRST116') {
				console.error(
					'❌ Table "fortunes" does not exist or you do not have permission to access it'
				);

				// List tables in the database
				console.log('Checking database tables...');
				const {data: tablesData, error: tablesError} = await supabase
					.from('pg_tables')
					.select('schemaname, tablename')
					.eq('schemaname', 'public');

				if (tablesError) {
					console.error('❌ Could not retrieve table information:', tablesError.message);
				} else {
					console.log('Available tables in public schema:');
					console.log(tablesData);

					// Check if required tables exist
					const tableNames = tablesData.map((t) => t.tablename);
					console.log('Required tables:');
					console.log('fortunes:', tableNames.includes('fortunes') ? '✅ Exists' : '❌ Missing');
					console.log('payments:', tableNames.includes('payments') ? '✅ Exists' : '❌ Missing');
				}
			} else {
				console.error('❌ Error querying fortunes table:', tableError.message);
			}
		} else {
			console.log('✅ Successfully connected to Supabase and queried fortunes table!');
			console.log('Table data:', tableData);

			// Check payments table
			const {data: paymentsData, error: paymentsError} = await supabase
				.from('payments')
				.select('*')
				.limit(1);

			if (paymentsError) {
				console.error('❌ Error querying payments table:', paymentsError.message);
			} else {
				console.log('✅ Successfully queried payments table!');
				console.log('Payments data:', paymentsData);
			}
		}

		// Check storage bucket
		console.log('Checking storage bucket...');
		const {data: bucketData, error: bucketError} = await supabase.storage.getBucket('coffee-cup');

		if (bucketError) {
			console.error('❌ Error accessing storage bucket:', bucketError.message);
		} else {
			console.log('✅ Successfully accessed storage bucket!');
			console.log('Bucket info:', bucketData);
		}
	} catch (error) {
		console.error('❌ Supabase verification failed:', error.message);
	}
}

verifySupabase();

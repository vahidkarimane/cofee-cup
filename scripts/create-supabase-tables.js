// Script to create the required Supabase tables
require('dotenv').config({path: '.env.local'});
const {createClient} = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function createRequiredTables() {
	try {
		console.log('Checking Supabase tables...');

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

		// Check if tables exist
		console.log('Checking if required tables exist...');

		// Try to query the tables directly to check if they exist
		console.log('Checking if fortunes table exists...');
		const {data: fortunesData, error: fortunesError} = await supabase
			.from('fortunes')
			.select('id')
			.limit(1);

		console.log('Checking if payments table exists...');
		const {data: paymentsData, error: paymentsError} = await supabase
			.from('payments')
			.select('id')
			.limit(1);

		const tableNames = [];
		if (!fortunesError || (fortunesError && !fortunesError.message.includes('does not exist'))) {
			tableNames.push('fortunes');
		}
		if (!paymentsError || (paymentsError && !paymentsError.message.includes('does not exist'))) {
			tableNames.push('payments');
		}

		console.log('Existing tables:', tableNames);

		// Check for required tables
		const requiredTables = ['fortunes', 'payments'];
		const missingTables = requiredTables.filter((table) => !tableNames.includes(table));

		if (missingTables.length === 0) {
			console.log('✅ All required tables exist');
		} else {
			console.log(`❌ Missing tables: ${missingTables.join(', ')}`);

			// Read the migration SQL file
			try {
				const migrationSql = fs.readFileSync(
					path.join(process.cwd(), 'migrations', 'create_supabase_tables.sql'),
					'utf8'
				);
				console.log('Found migration SQL file');

				// Execute the SQL
				console.log('Creating missing tables...');
				const {error: sqlError} = await supabase.rpc('exec_sql', {
					sql_string: migrationSql,
				});

				if (sqlError) {
					console.error('❌ Error executing SQL:', sqlError.message);

					// Try executing the SQL directly
					console.log('Trying to execute SQL directly...');

					// Split the SQL into separate statements
					const statements = migrationSql
						.split(';')
						.map((stmt) => stmt.trim())
						.filter((stmt) => stmt.length > 0);

					for (const statement of statements) {
						console.log(`Executing: ${statement.substring(0, 50)}...`);
						const {error} = await supabase.rpc('exec_sql', {
							sql_string: statement,
						});

						if (error) {
							console.error('❌ Error:', error.message);
						} else {
							console.log('✅ Statement executed successfully');
						}
					}
				} else {
					console.log('✅ Tables created successfully');
				}

				// Verify tables were created
				console.log('Verifying tables were created...');

				// Check fortunes table
				const {error: verifyFortunesError} = await supabase.from('fortunes').select('id').limit(1);

				// Check payments table
				const {error: verifyPaymentsError} = await supabase.from('payments').select('id').limit(1);

				console.log(
					`Table 'fortunes': ${!verifyFortunesError || !verifyFortunesError.message.includes('does not exist') ? '✅ Exists' : '❌ Missing'}`
				);
				console.log(
					`Table 'payments': ${!verifyPaymentsError || !verifyPaymentsError.message.includes('does not exist') ? '✅ Exists' : '❌ Missing'}`
				);
			} catch (fsError) {
				console.error('❌ Error reading migration file:', fsError.message);
			}
		}
	} catch (error) {
		console.error('❌ Supabase table creation failed:', error.message);
	}
}

createRequiredTables();

/**
 * Environment Variable Validator
 * Checks that all required env vars are set before the app starts.
 * Call this AFTER dotenv.config() but BEFORE anything else.
 */

const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRES_IN'
];

const optionalVars = [
    { name: 'PORT', default: '3000' },
    { name: 'NODE_ENV', default: 'development' },
    { name: 'DEFAULT_ADMIN_PASSWORD', default: null }
];

function validateEnv() {
    const missing = [];

    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }

    if (missing.length > 0) {
        console.error('❌ FATAL: Missing required environment variables:');
        missing.forEach(v => console.error(`   - ${v}`));
        console.error('\n   Create a .env file in the backend/ directory.');
        console.error('   See .env.example for reference.\n');
        process.exit(1);
    }

    // Set defaults for optional vars
    for (const { name, default: defaultVal } of optionalVars) {
        if (!process.env[name] && defaultVal !== null) {
            process.env[name] = defaultVal;
        }
    }

    // Warn if JWT_SECRET is weak
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 20) {
        console.warn('⚠️  WARNING: JWT_SECRET is too short. Use at least 20 characters for production.');
    }

    console.log('✅ Environment variables validated successfully.');
}

module.exports = validateEnv;

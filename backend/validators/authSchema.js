const { z } = require('zod');

const loginSchema = z.object({
    username: z.string()
        .min(1, 'Username is required')
        .max(50, 'Username must be at most 50 characters')
        .trim(),
    password: z.string()
        .min(1, 'Password is required')
        .max(128, 'Password must be at most 128 characters')
});

module.exports = { loginSchema };

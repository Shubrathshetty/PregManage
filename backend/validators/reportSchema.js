const { z } = require('zod');

const reportSchema = z.object({
    identifier: z.string()
        .min(1, 'Email or phone number is required')
        .max(100, 'Identifier must be at most 100 characters')
        .trim(),
    subject: z.string()
        .min(3, 'Subject must be at least 3 characters')
        .max(200, 'Subject must be at most 200 characters')
        .trim(),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must be at most 2000 characters')
        .trim()
});

module.exports = { reportSchema };

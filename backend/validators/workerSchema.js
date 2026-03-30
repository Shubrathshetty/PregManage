const { z } = require('zod');

const workerSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name must only contain letters and spaces"),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  phone: z.string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(1, "Street name is required"),
    taluk: z.string().min(1, "Taluk is required"),
    district: z.string().min(1, "District is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().length(6, "Pincode must be exactly 6 digits").regex(/^[1-9]\d{5}$/, "Invalid pincode format")
  }).optional(),
  isActive: z.boolean().optional()
});

module.exports = { workerSchema };

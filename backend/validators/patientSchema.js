const { z } = require('zod');

const patientSchema = z.object({
  fullName: z.string()
    .min(3, "Full name must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name must only contain letters and spaces"),
  dateOfBirth: z.string().transform((val) => new Date(val)),
  age: z.coerce.number(),
  phone: z.string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  address: z.object({
    street: z.string().min(1, "Street name is required"),
    taluk: z.string().min(1, "Taluk is required"),
    district: z.string().min(1, "District is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().length(6, "Pincode must be exactly 6 digits").regex(/^[1-9]\d{5}$/, "Invalid pincode format")
  }),
  lmpDate: z.string().transform((val) => new Date(val)),
  edd: z.string().transform((val) => new Date(val)),
  currentMonthOfPregnancy: z.coerce.number().min(1).max(9)
});

module.exports = { patientSchema };

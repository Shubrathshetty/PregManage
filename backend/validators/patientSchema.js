const { z } = require('zod');

const patientSchema = z.object({
  fullName: z.string()
    .min(3, "Full name must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name must only contain letters and spaces"),
  dateOfBirth: z.string().transform((val) => new Date(val)),
  age: z.coerce.number(),
  husbandName: z.string()
    .min(3, "Partner's name must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Partner's name must only contain letters and spaces"),
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
  aadhaar: z.string().length(12, "Aadhaar must be exactly 12 digits").regex(/^[2-9]\d{11}$/, "Invalid Aadhaar format"),
  lmpDate: z.string().transform((val) => new Date(val)),
  edd: z.string().transform((val) => new Date(val)),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  gravida: z.coerce.number().min(1),
  para: z.coerce.number().min(0)
});

module.exports = { patientSchema };

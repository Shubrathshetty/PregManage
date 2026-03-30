const { z } = require('zod');

const questionnaireSchema = z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    answers: z.object({
        q1_pain_tooth: z.boolean({ required_error: 'q1_pain_tooth is required' }),
        q2_food_lodgement: z.boolean({ required_error: 'q2_food_lodgement is required' }),
        q3_bleeding_gums: z.boolean({ required_error: 'q3_bleeding_gums is required' }),
        q4_bad_breath: z.boolean({ required_error: 'q4_bad_breath is required' }),
        q5_burning_sensation: z.boolean({ required_error: 'q5_burning_sensation is required' }),
        q6_ulcers: z.boolean({ required_error: 'q6_ulcers is required' }),
        q7_difficulty_opening_mouth: z.boolean({ required_error: 'q7_difficulty_opening_mouth is required' }),
        q8_malaigned_teeth: z.boolean({ required_error: 'q8_malaigned_teeth is required' }),
        q9_missing_teeth: z.boolean({ required_error: 'q9_missing_teeth is required' })
    })
});

const consultationSchema = z.object({
    doctorConsultation: z.boolean(),
    consultationType: z.enum(['hospital', 'home']).nullable().optional(),
    hospitalVisitDetails: z.object({
        date: z.string().nullable().optional(),
        time: z.string().nullable().optional(),
        hospitalName: z.string().nullable().optional(),
        location: z.string().nullable().optional()
    }).optional(),
    homeVisitDetails: z.object({
        date: z.string().nullable().optional(),
        time: z.string().nullable().optional(),
        location: z.string().nullable().optional()
    }).optional(),
    whatsappNumber: z.string().nullable().optional()
});

module.exports = { questionnaireSchema, consultationSchema };

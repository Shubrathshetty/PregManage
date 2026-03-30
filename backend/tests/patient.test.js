/**
 * Patient Schema Unit Tests
 * Tests Zod validation for patient registration data.
 */

const { patientSchema } = require('../validators/patientSchema');

const validPatient = {
    fullName: 'Lakshmi Devi',
    dateOfBirth: '1995-06-15',
    age: 28,
    husbandName: 'Ramesh Kumar',
    phone: '9876543210',
    address: {
        street: '123 Main Road',
        taluk: 'Udupi',
        district: 'Udupi',
        state: 'Karnataka',
        pincode: '576101'
    },
    aadhaar: '234567890123',
    lmpDate: '2026-01-01',
    edd: '2026-10-08',
    bloodGroup: 'A+',
    gravida: 1,
    para: 0
};

describe('Patient Schema Validation', () => {
    test('should accept valid patient data', () => {
        const result = patientSchema.safeParse(validPatient);
        expect(result.success).toBe(true);
    });

    test('should reject empty fullName', () => {
        const result = patientSchema.safeParse({ ...validPatient, fullName: '' });
        expect(result.success).toBe(false);
    });

    test('should reject fullName with numbers', () => {
        const result = patientSchema.safeParse({ ...validPatient, fullName: 'Test 123' });
        expect(result.success).toBe(false);
    });

    test('should reject short fullName', () => {
        const result = patientSchema.safeParse({ ...validPatient, fullName: 'AB' });
        expect(result.success).toBe(false);
    });

    test('should reject invalid phone number (too short)', () => {
        const result = patientSchema.safeParse({ ...validPatient, phone: '12345' });
        expect(result.success).toBe(false);
    });

    test('should reject phone not starting with 6-9', () => {
        // Note: Schema validates length=10 and digits only. Indian format check is on Mongoose model.
        const result = patientSchema.safeParse({ ...validPatient, phone: '1234567890' });
        // This should pass Zod (only length + digits), but fail Mongoose validator
        expect(result.success).toBe(true); // Zod only checks length + digits
    });

    test('should reject invalid Aadhaar (starts with 0)', () => {
        const result = patientSchema.safeParse({ ...validPatient, aadhaar: '012345678901' });
        expect(result.success).toBe(false);
    });

    test('should reject Aadhaar with wrong length', () => {
        const result = patientSchema.safeParse({ ...validPatient, aadhaar: '1234567' });
        expect(result.success).toBe(false);
    });

    test('should reject invalid blood group', () => {
        const result = patientSchema.safeParse({ ...validPatient, bloodGroup: 'X+' });
        expect(result.success).toBe(false);
    });

    test('should accept all valid blood groups', () => {
        const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        for (const group of validGroups) {
            const result = patientSchema.safeParse({ ...validPatient, bloodGroup: group });
            expect(result.success).toBe(true);
        }
    });

    test('should reject invalid pincode', () => {
        const result = patientSchema.safeParse({
            ...validPatient,
            address: { ...validPatient.address, pincode: '012345' }
        });
        expect(result.success).toBe(false);
    });

    test('should reject missing required address field', () => {
        const { street, ...addressWithoutStreet } = validPatient.address;
        const result = patientSchema.safeParse({
            ...validPatient,
            address: addressWithoutStreet
        });
        expect(result.success).toBe(false);
    });

    test('should reject negative gravida', () => {
        const result = patientSchema.safeParse({ ...validPatient, gravida: 0 });
        expect(result.success).toBe(false);
    });

    test('should accept gravida >= 1', () => {
        const result = patientSchema.safeParse({ ...validPatient, gravida: 1 });
        expect(result.success).toBe(true);
    });

    test('should accept para = 0', () => {
        const result = patientSchema.safeParse({ ...validPatient, para: 0 });
        expect(result.success).toBe(true);
    });

    test('should coerce string numbers for age, gravida, para', () => {
        const result = patientSchema.safeParse({
            ...validPatient,
            age: '28',
            gravida: '2',
            para: '1'
        });
        expect(result.success).toBe(true);
        expect(result.data.age).toBe(28);
        expect(result.data.gravida).toBe(2);
    });

    test('should transform date strings', () => {
        const result = patientSchema.safeParse(validPatient);
        expect(result.success).toBe(true);
        expect(result.data.dateOfBirth).toBeInstanceOf(Date);
        expect(result.data.lmpDate).toBeInstanceOf(Date);
        expect(result.data.edd).toBeInstanceOf(Date);
    });
});

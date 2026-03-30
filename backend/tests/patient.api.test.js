/**
 * Patient API Integration Tests
 * Tests patient-related endpoints using supertest.
 * NOTE: Requires a running MongoDB instance. Skips if MONGODB_URI is not set.
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

// We need to set up env before requiring app
process.env.JWT_SECRET = 'test_jwt_secret_for_api_tests';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

// Mock logger to suppress output during tests
jest.mock('../config/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    stream: { write: jest.fn() }
}));

// Mock connectDB to avoid actual DB connection during unit tests
jest.mock('../config/db', () => jest.fn());

// Mock validateEnv to skip env validation during tests
jest.mock('../config/env', () => jest.fn());

describe('Patient API Endpoints (Mocked)', () => {
    let app;

    beforeAll(() => {
        // Require app after mocks are in place
        app = require('../server');
    });

    const generateWorkerToken = () => {
        return jwt.sign(
            { id: 'worker123', username: 'testworker', name: 'Test Worker', role: 'worker' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    };

    const generateAdminToken = () => {
        return jwt.sign(
            { id: 'admin123', username: 'admin', name: 'Admin', role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    };

    describe('GET /api/patients', () => {
        test('should reject request without token', async () => {
            const res = await request(app).get('/api/patients');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('should reject request with admin token (worker only)', async () => {
            const token = generateAdminToken();
            const res = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(403);
        });
    });

    describe('POST /api/patients', () => {
        test('should reject request without token', async () => {
            const res = await request(app)
                .post('/api/patients')
                .send({});
            expect(res.status).toBe(401);
        });

        test('should reject invalid patient data with worker token', async () => {
            const token = generateWorkerToken();
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${token}`)
                .send({ fullName: '' }); // Invalid data
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('Auth Endpoints', () => {
        test('POST /api/auth/admin/login should reject empty body', async () => {
            const res = await request(app)
                .post('/api/auth/admin/login')
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('POST /api/auth/admin/login should reject missing password', async () => {
            const res = await request(app)
                .post('/api/auth/admin/login')
                .send({ username: 'admin' });
            expect(res.status).toBe(400);
        });

        test('GET /api/auth/verify should reject without token', async () => {
            const res = await request(app).get('/api/auth/verify');
            expect(res.status).toBe(401);
        });

        test('GET /api/auth/verify should accept valid token', async () => {
            const token = generateAdminToken();
            const res = await request(app)
                .get('/api/auth/verify')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.role).toBe('admin');
        });

        test('POST /api/auth/logout should succeed', async () => {
            const res = await request(app)
                .post('/api/auth/logout');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('Report Endpoints', () => {
        test('POST /api/reports should reject empty body', async () => {
            const res = await request(app)
                .post('/api/reports')
                .send({});
            expect(res.status).toBe(400);
        });

        test('POST /api/reports should reject short description', async () => {
            const res = await request(app)
                .post('/api/reports')
                .send({
                    identifier: 'test@example.com',
                    subject: 'Bug Report',
                    description: 'Short' // < 10 chars
                });
            expect(res.status).toBe(400);
        });
    });

    describe('404 Handling', () => {
        test('should return 404 for unknown API route', async () => {
            const res = await request(app).get('/api/nonexistent');
            expect(res.status).toBe(404);
        });
    });
});

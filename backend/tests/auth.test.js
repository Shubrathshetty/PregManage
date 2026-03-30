/**
 * Auth Module Unit Tests
 * Tests JWT verification middleware, login schema, and role guards.
 */

const jwt = require('jsonwebtoken');
const { verifyToken, requireAdmin, requireWorker } = require('../middleware/auth');
const { loginSchema } = require('../validators/authSchema');

// Mock secret for testing
const TEST_SECRET = 'test_jwt_secret_for_unit_tests';

describe('Auth Middleware - verifyToken', () => {
    let req, res, next;

    beforeEach(() => {
        process.env.JWT_SECRET = TEST_SECRET;
        req = { cookies: {}, headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    test('should reject request with no token', () => {
        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false, message: expect.stringContaining('No token') })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('should accept valid token from Authorization header', () => {
        const token = jwt.sign({ id: 'user123', role: 'admin' }, TEST_SECRET, { expiresIn: '1h' });
        req.headers.authorization = `Bearer ${token}`;

        verifyToken(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe('user123');
        expect(req.user.role).toBe('admin');
    });

    test('should accept valid token from cookie', () => {
        const token = jwt.sign({ id: 'user456', role: 'worker' }, TEST_SECRET, { expiresIn: '1h' });
        req.cookies = { token };

        verifyToken(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user.id).toBe('user456');
    });

    test('should reject expired token', () => {
        const token = jwt.sign({ id: 'user789' }, TEST_SECRET, { expiresIn: '-1s' });
        req.headers.authorization = `Bearer ${token}`;

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false, message: expect.stringContaining('Invalid or expired') })
        );
    });

    test('should reject malformed token', () => {
        req.headers.authorization = 'Bearer not.a.valid.token';

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should prioritize Authorization header over cookie', () => {
        const headerToken = jwt.sign({ id: 'header_user', role: 'admin' }, TEST_SECRET);
        const cookieToken = jwt.sign({ id: 'cookie_user', role: 'worker' }, TEST_SECRET);

        req.headers.authorization = `Bearer ${headerToken}`;
        req.cookies = { token: cookieToken };

        verifyToken(req, res, next);

        expect(req.user.id).toBe('header_user');
    });
});

describe('Auth Middleware - requireAdmin', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('should allow admin role', () => {
        req.user.role = 'admin';
        requireAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test('should reject non-admin role', () => {
        req.user.role = 'worker';
        requireAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});

describe('Auth Middleware - requireWorker', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    test('should allow worker role', () => {
        req.user.role = 'worker';
        requireWorker(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test('should reject non-worker role', () => {
        req.user.role = 'admin';
        requireWorker(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });
});

describe('Login Schema Validation', () => {
    test('should accept valid login input', () => {
        const result = loginSchema.safeParse({ username: 'admin', password: 'pass123' });
        expect(result.success).toBe(true);
    });

    test('should reject empty username', () => {
        const result = loginSchema.safeParse({ username: '', password: 'pass123' });
        expect(result.success).toBe(false);
    });

    test('should reject empty password', () => {
        const result = loginSchema.safeParse({ username: 'admin', password: '' });
        expect(result.success).toBe(false);
    });

    test('should reject missing fields', () => {
        const result = loginSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    test('should trim whitespace from username', () => {
        const result = loginSchema.safeParse({ username: '  admin  ', password: 'pass123' });
        expect(result.success).toBe(true);
        expect(result.data.username).toBe('admin');
    });
});

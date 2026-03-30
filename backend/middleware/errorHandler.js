/**
 * Global Error Handler Middleware
 * Catches all unhandled errors and returns a consistent JSON response.
 */

const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    // Log the error for server-side debugging
    logger.error(`❌ [ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
    if (process.env.NODE_ENV !== 'production' && err.stack) {
        logger.error(err.stack);
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.'
        });
    }

    if (err.message && err.message.includes('Only image files')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed.',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `Duplicate value for field: ${field}. Please use a different value.`
        });
    }

    // Mongoose bad ObjectId (CastError)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format.'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token has expired.'
        });
    }

    // Zod validation errors
    if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = err.errors.map(e => ({
            field: e.path?.join('.') || 'unknown',
            message: e.message
        }));
        return res.status(400).json({
            success: false,
            message: 'Validation failed.',
            errors: errorMessages
        });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal server error.' : err.message
    });
};

module.exports = errorHandler;

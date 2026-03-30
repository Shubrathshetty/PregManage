const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

// Fix #4: Validate required env vars at startup
const validateEnv = require('./config/env');
validateEnv();

// Fix #7: Winston logger
const logger = require('./config/logger');

const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Fix #8: Security middleware — sanitize MongoDB queries
const mongoSanitize = require('express-mongo-sanitize');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compatibility workaround for Express 5: Make req.query writable
// so legacy middleware like xss-clean and express-mongo-sanitize can mutate it.
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: req.query
    });
    next();
});

// Fix #8: Sanitize request data to prevent NoSQL injection and XSS
const xss = require('xss-clean');
app.use(xss());
app.use(mongoSanitize());
// Fix #7: Request logger using winston (replaces console.log)
app.use((req, res, next) => {
    logger.info(`[${req.method}] ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Fix #5: Rate limit on auth routes
const { authLimiter } = require('./middleware/rateLimiter');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(uploadsDir));

// Fix #11: Swagger API docs
const setupSwagger = require('./swagger');
setupSwagger(app);

// Explicit route for HTML files to avoid tunnel issues
app.get('/:page.html', (req, res) => {
    const filePath = path.join(__dirname, '..', 'frontend', `${req.params.page}.html`);
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    res.status(404).sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// API Routes (Fix #5: rate limit on auth)
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/questionnaires', require('./routes/questionnaireRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Serve frontend index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Catch-all: serve index.html for SPA-style navigation, excluding APIs
app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found.' });
    }
    
    // Try to serve the exact file if it's not handled by express.static
    const requestedPath = req.path === '/' ? 'index.html' : req.path;
    const filePath = path.join(__dirname, '..', 'frontend', requestedPath);
    
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        res.sendFile(filePath);
    } else {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
    }
});

// Fix #3: Global error handler (must be AFTER all routes)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`🤰 PregManage Server running on http://localhost:${PORT}`);
    logger.info(`📚 API docs at http://localhost:${PORT}/api-docs`);
});

// Export for testing
module.exports = app;

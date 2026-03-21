const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});


// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/questionnaires', require('./routes/questionnaireRoutes'));
app.use('/api/reports', require('./routes/reportRoutes')); // Feedback/Reports


// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Catch-all: serve index.html for SPA-style navigation
app.get(/^(?!\/api).+/, (req, res) => {
    // If it's an API route that wasn't matched, return 404




    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found.' });
    }
    // Otherwise try to serve the file
    const filePath = path.join(__dirname, '..', 'frontend', req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🤰 PregManage Server running on http://localhost:${PORT}\n`);
});

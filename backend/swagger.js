const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PregManage API',
            version: '1.0.0',
            description: 'Pregnancy Management System for Anganwadi Workers - REST API Documentation',
            contact: {
                name: 'PregManage Team',
                url: 'https://github.com/Shubrathshetty/PregManage'
            }
        },
        servers: [
            {
                url: '/api',
                description: 'API Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', example: 'admin' },
                        password: { type: 'string', example: 'password123' }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        token: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                role: { type: 'string' }
                            }
                        }
                    }
                },
                Patient: {
                    type: 'object',
                    required: ['fullName', 'dateOfBirth', 'age', 'husbandName', 'phone', 'address', 'aadhaar', 'lmpDate', 'edd', 'bloodGroup', 'gravida', 'para'],
                    properties: {
                        fullName: { type: 'string', example: 'Lakshmi Devi' },
                        dateOfBirth: { type: 'string', format: 'date', example: '1995-06-15' },
                        age: { type: 'number', example: 28 },
                        husbandName: { type: 'string', example: 'Ramesh Kumar' },
                        phone: { type: 'string', example: '9876543210' },
                        address: {
                            type: 'object',
                            properties: {
                                street: { type: 'string' },
                                taluk: { type: 'string' },
                                district: { type: 'string' },
                                state: { type: 'string' },
                                pincode: { type: 'string' }
                            }
                        },
                        aadhaar: { type: 'string', example: '234567890123' },
                        lmpDate: { type: 'string', format: 'date' },
                        edd: { type: 'string', format: 'date' },
                        bloodGroup: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
                        gravida: { type: 'number', example: 1 },
                        para: { type: 'number', example: 0 }
                    }
                },
                Report: {
                    type: 'object',
                    required: ['identifier', 'subject', 'description'],
                    properties: {
                        identifier: { type: 'string', example: 'user@example.com' },
                        subject: { type: 'string', example: 'App Issue' },
                        description: { type: 'string', example: 'Detailed issue description here.' }
                    }
                },
                PaginatedResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        totalPages: { type: 'number' },
                        totalCount: { type: 'number' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' }
                    }
                }
            }
        },
        paths: {
            '/auth/admin/login': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Admin login',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { '$ref': '#/components/schemas/LoginRequest' }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Login successful', content: { 'application/json': { schema: { '$ref': '#/components/schemas/LoginResponse' } } } },
                        '401': { description: 'Invalid credentials' },
                        '429': { description: 'Too many attempts' }
                    }
                }
            },
            '/auth/worker/login': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Worker login',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { '$ref': '#/components/schemas/LoginRequest' }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Login successful' },
                        '401': { description: 'Invalid credentials' }
                    }
                }
            },
            '/auth/verify': {
                get: {
                    tags: ['Authentication'],
                    summary: 'Verify JWT token',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': { description: 'Token valid' },
                        '401': { description: 'Token invalid or expired' }
                    }
                }
            },
            '/auth/logout': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Logout',
                    responses: {
                        '200': { description: 'Logged out' }
                    }
                }
            },
            '/patients': {
                get: {
                    tags: ['Patients'],
                    summary: 'Get all patients (worker only, paginated)',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
                    ],
                    responses: {
                        '200': { description: 'List of patients' }
                    }
                },
                post: {
                    tags: ['Patients'],
                    summary: 'Register a new patient (worker only)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: { '$ref': '#/components/schemas/Patient' }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'Patient registered' },
                        '400': { description: 'Validation error or duplicate' }
                    }
                }
            },
            '/reports': {
                get: {
                    tags: ['Reports'],
                    summary: 'Get all reports (paginated)',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
                    ],
                    responses: {
                        '200': { description: 'List of reports' }
                    }
                },
                post: {
                    tags: ['Reports'],
                    summary: 'Submit a report/feedback',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { '$ref': '#/components/schemas/Report' }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'Report submitted' }
                    }
                }
            }
        }
    },
    apis: [] // We define paths inline above
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'PregManage API Docs'
    }));
    console.log('📚 Swagger docs available at /api-docs');
}

module.exports = setupSwagger;

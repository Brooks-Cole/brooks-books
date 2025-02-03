// backend/src/config/cors.js
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://brooks-books.vercel.app',  // Main production domain
            'http://localhost:3000',            // Local frontend development
            'http://localhost:3001',            // Local backend development
            'https://brooks-books.onrender.com' // Backend production domain
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Upgrade',
        'Connection',
        'Sec-WebSocket-Key',
        'Sec-WebSocket-Version'
    ],
    exposedHeaders: ['Set-Cookie'],
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};


export default corsOptions;
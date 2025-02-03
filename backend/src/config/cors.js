// backend/src/config/cors.js
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            // Production domains
            'https://brooks-books.vercel.app',     // Current production frontend
            'https://brooks-books.onrender.com',   // Current production backend
            
            // Add your new domains here once you deploy
            // 'https://your-new-domain.vercel.app',
            // 'https://your-new-backend.onrender.com',
            
            // Development domains
            'http://localhost:3000',               // Frontend development
            'http://localhost:3001',               // Backend development
            'http://localhost:5000',               // Alternative backend port
            'http://127.0.0.1:3000',              // Alternative localhost
            'http://127.0.0.1:3001',
            'http://127.0.0.1:5000'
        ];

        // Development mode check
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // In development, allow all origins
        if (isDevelopment) {
            return callback(null, true);
        }

        // In production, check against allowedOrigins
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
    optionsSuccessStatus: 200
};

export default corsOptions;
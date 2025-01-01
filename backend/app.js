const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Setting up config.env file variables
dotenv.config({ path: './config/config.env' });

// Handling Uncaught Exceptions
process.on('uncaughtException', err => {
   console.log(`Error: ${err.message}`);
   console.log('Shutting down due to Uncaught Exception.');
   process.exit(1);
});

// Connecting to MongoDB Database
const connectDatabase = require('./config/database');
connectDatabase();

// Setting up Body Parser
app.use(bodyParser.urlencoded({ extended: true }));

// Setting up Security Http Headers
app.use(helmet());

// Setting up Body Parser for JSON data
app.use(express.json());

// Setting cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS Attacks
app.use(xssClean());

// Prevent Parameter Pollution
app.use(hpp({
   whitelist: ['positions']
}));

// Implementing Rate Limit
const limiter = rateLimit({
   windowMs: 10 * 60 * 1000,
   max: 100
});

app.use(limiter);

// Setting up CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL  // Replace with your Render URL
        : 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    preflightContinue: false,
}));

app.options('*', cors());

// Importing all routes
const check = require('./routes/check');
app.use('/api/v1', check);

const jobs = require('./routes/jobs');
app.use('/api/v1', jobs);

const auth = require('./routes/auth');
app.use('/api/v1', auth);

const user = require('./routes/user');
app.use('/api/v1', user);


// Production setup - serve static files
if (process.env.NODE_ENV === 'production') {
   // Serve static files from the 'frontend/jobbee/build' directory
   app.use(express.static(path.join(__dirname, '../frontend/jobbee/build')));
   
   // Handle all routes by sending the 'index.html' from the build directory
   app.get('*', (req, res) => {
       res.sendFile(path.join(__dirname, '../frontend/jobbee/build', 'index.html'));
   });
}


// Handling Unhandled Routes
app.all('*', (req, res, next) => {
   next(new ErrorHandler(`${req.originalUrl} Route Not Found`, 404));
});

// Setting up the "global error handling middleware"
app.use(errorMiddleware);

// Starting the server
const PORT = process.env.PORT;
const server = app.listen(PORT, async () => {
   console.log(`Server has started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

// Handling Unhandled Promise Rejection Error
process.on('unhandledRejection', err => {
   console.log(`Error: ${err.message}`);
   console.log('Shutting down the server due to unhandled promise rejection.');
   server.close(() => {
       process.exit(1);
   });
});
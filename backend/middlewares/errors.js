const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    // separating the "dev" errors and "prod" errors
    if(process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        });
    }

    if(process.env.NODE_ENV.trim() === 'production') {
        let error = {...err};
        error.message = err.message;

        // Handling Wrong Mongoose ObjectId Error (CastError)
        if(err.name === 'CastError') {
            const message = `Resource Not Found. Invalid: ${err.path}`;
            error = new ErrorHandler(message, 404);
        }

        // Handling Mongoose Validation Error
        if(err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message, 400);
        }

        // Handling Mongoose Duplicate Key Error
        if(err.code === 11000) {
            const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
            error = new ErrorHandler(message, 400);
        }

        // Handling Wrong JWT Token Error
        if(err.name === 'JsonWebTokenError') {
            const message = 'JSON Web Token is invalid. Please try again!';
            error = new ErrorHandler(message, 500);
        }

        // Handling Expired JWT Token Error
        if(err.name === 'TokenExpiredError') {
            const message = 'JSON Web Token is expired. Please try again!';
            error = new ErrorHandler(message, 500);
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error.'
        });
    }
}

/*

"Object.keys()" is used to extract the name of the field(s) that 
caused the duplicate key error.

"err.keyValue" is an object that contains the field(s) and value(s) 
that caused the duplication. 
For example, if the duplicate error was due to an email, then
'err.keyValue' might look like { email: "example@example.com" }.

"Object.keys(err.keyValue)" retrieves the keys of this object, in 
this case, the field name, like "email".

*/
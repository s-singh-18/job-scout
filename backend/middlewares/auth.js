const jwt = require('jsonwebtoken');
const User = require('../models/users');
const catchAsyncErrors = require('./catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// Checking if the user is Authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token; // HTTP-only cookie
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new ErrorHandler('Please login to access this resource.', 401));
    }

    // Verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    next();
});

// Handling user role [normal users cannot create a job]
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`${capitalizeFirst(req.user.role)} is not allowed to access this resource.`, 403));
        }
        next();
    }
}
const express = require('express');
const User = require('../models/users');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Register a new user => '/api/v1/register'
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendToken(user, 200, res);
});


// Login user => '/api/v1/login'
exports.loginUser = catchAsyncErrors( async(req, res, next) => {
    const { email, password } = req.body;

    // Checking if email and password is entered by the user
    if(!email || !password) {
        return next(new ErrorHandler('Please enter Email and Password', 400));
    }

    // Finding user in the database
    const user = await User.findOne({email}).select('+password');

    if(!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    // Checking if password is correct
    const isPasswordMatching = await user.comparePassword(password);

    if(!isPasswordMatching) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res);
});


// Forgot Password => '/api/v1/password/forgot'
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    // Checking user email in database
    if(!user) {
        return next(new ErrorHandler('No user found with this email.', 404));
    }

    // Getting the reset password token
    const resetToken = user.getResetPasswordToken();
    
    // Saving the reset token in the database
    await user.save({ validateBeforeSave: false });


    // Creating reset password URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset link is as follows:\n\n${resetUrl}
    \n\n If you have not requested this, then please ignore this email.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'JobScout Password Recovery',
            message
        });
    
        res.status(200).json({
            success: true,
            message: `Email sent successfully to: ${user.email}`,
            resetToken: resetToken // Send the reset token in the response
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // saving the user
        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler('Email is not sent!', 500));
    }
});


// Reset Password => '/api/v1/password/reset/:token'
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Hashing URL Token
    const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

    // finding a user in database that has the same hashed resetPasswordToken
    const user = await User.findOne(
        { 
            resetPasswordToken, 
            resetPasswordExpire: { $gt : Date.now() }
        }
    );

    if(!user) {
        return next(new ErrorHandler('Password Reset token is invalid or has been expired.', 400));
    }

    // Setting up the new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Assigning token to that user
    sendToken(user, 200, res);
});


// Logout User => '/api/v1/logout'
exports.logout = catchAsyncErrors(async (req, res, next) => {
    // Setting the Cookie to none and making it Expiry Instantly
    res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
    });
});


// Checking if a user is authenticated => '/api/v1/auth/check'
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    // Assuming you're using JWT and the token is stored in a cookie
    const token = req.cookies.token;
  
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Returning both authentication status and role
      return res.json({
        success: true,
        user: {
          id: user._id,
          role: user.role, // Include role info here
        },
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
});
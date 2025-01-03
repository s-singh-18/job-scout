const express = require('express');
const router = express.Router();

const { 
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    logout,
    isAuthenticated
} = require('../controllers/authController');

const { isAuthenticatedUser } = require('../middlewares/auth'); // protecting the routes

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(isAuthenticatedUser, logout);

router.route('/auth/check').get(isAuthenticated);

module.exports = router;
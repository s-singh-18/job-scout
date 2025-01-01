const express = require('express');
const router = express.Router();

const {
    isAuthenticated
} = require('../controllers/authController');

router.route('/auth/check').get(isAuthenticated);

module.exports = router;
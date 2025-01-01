// Create and Send JWT Token in a secure HttpOnly Cookie
const sendToken = (user, statusCode, res) => {
    // Create JWT Token
    const token = user.getJwtToken();

    // Options for Cookie
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;  // Only set cookies over HTTPS in production
        options.sameSite = 'None';  // SameSite=None for cross-site cookies
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
}

module.exports = sendToken;
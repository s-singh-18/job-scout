const express = require('express');
const router = express.Router();
const { profilePicUpload, resumeUpload } = require('../middlewares/upload');

const {
    getUserById,
    getUserProfile, 
    updatePassword,
    deleteUser,
    getAppliedJobs,
    getPublishedJobs,
    getUsers,
    deleteUserAdmin,
    updateUserProfile,
    uploadResume
} = require('../controllers/userController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// using the "isAuthenticatedUser" for all routes
router.use(isAuthenticatedUser);


// Route to get a user by ID
router.route('/user/:id').get(getUserById);

// Route to get the user's profile
router.route('/profile').get(getUserProfile);

// Route to update user profile (name, email, profile picture)
router.route('/profile/update').put(profilePicUpload.single('profilePicture'), updateUserProfile);

// Route to upload or update resume
router.route('/user/resume').put(resumeUpload.single('resume'), uploadResume);

// Routes to get jobs (applied and published)
router.route('/jobs/applied').get(authorizeRoles('user'), getAppliedJobs);
router.route('/jobs/published').get(authorizeRoles('employer', 'admin'), getPublishedJobs);

// Route to update password
router.route('/password/update').put(updatePassword);

// Route to delete the user's profile
router.route('/profile/delete').delete(deleteUser);

// Admin only routes to get all users and delete a specific user
router.route('/users').get(authorizeRoles('admin'), getUsers);
router.route('/user/:id').delete(authorizeRoles('admin'), deleteUserAdmin);

module.exports = router;
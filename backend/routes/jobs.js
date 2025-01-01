const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth'); // protecting the routes
const { resumeUpload } = require('../middlewares/upload'); // Import the upload middleware


// Importing jobs controller method
const { 
    getJobs,
    getJob, 
    newJob, 
    getJobsInRadius, 
    updateJob, 
    deleteJob,
    jobStats,
    applyJob,
    getActivityJobs
} = require('../controllers/jobsController');

// GET Requests
router.route('/jobs').get(getJobs); // Calls the controller method on GET request

// router.route('/jobs/:zipcode/:distance').get(getJobsInRadius);

router.route('/job/:id/:slug').get(isAuthenticatedUser, getJob);

router.route('/stats/:topic').get(jobStats);

// Role-based fetching of jobs
router.route('/jobs/activity').get(isAuthenticatedUser, getActivityJobs);



// POST Requests
router.route('/job/new').post(isAuthenticatedUser, authorizeRoles('employer', 'admin'), newJob);


// PUT Requests
router.route('/job/:id').put(isAuthenticatedUser, authorizeRoles('employer', 'admin'), updateJob);

// router.route('/job/:id/apply').put(isAuthenticatedUser, authorizeRoles('user'), applyJob);
router.route('/job/:id/apply').put(
    isAuthenticatedUser, 
    authorizeRoles('user'), 
    resumeUpload.single('resume'), // Use resumeUpload middleware
    applyJob
);
    

// DELETE Requests
router.route('/job/:id').delete(isAuthenticatedUser, authorizeRoles('employer', 'admin'), deleteJob);


module.exports = router;
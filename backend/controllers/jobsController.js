const Job = require('../models/jobs');
const User = require('../models/users');
const opencage = require('opencage-api-client');
const cloudinary = require('cloudinary');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFilters = require('../utils/apiFilters');


// Get all Jobs => '/api/v1/jobs'
exports.getJobs = catchAsyncErrors(async (req, res, next) => {
    const apiFilters = new APIFilters(Job.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .searchByQuery()
        .pagination();

    const jobs = await apiFilters.query;

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    });
});


// Create a new Job => '/api/v1/job/new'
exports.newJob = catchAsyncErrors(async (req, res, next) => {
    // Adding user (role = employer/admin) to body
    req.body.user = req.user.id;

    const { address, ...jobData } = req.body;
    let location = {};

    // Geocode the address if provided (forward geocoding -> address to coordinates)
    if (address) {
        try {
            const geocodeResponse = await opencage.geocode({ q: address, key: process.env.OPENCAGE_API_KEY });
            if (geocodeResponse.status.code === 200 && geocodeResponse.results.length > 0) {
                location = {
                    lat: geocodeResponse.results[0].geometry.lat,
                    lng: geocodeResponse.results[0].geometry.lng,
                    formatted: geocodeResponse.results[0].formatted,
                };
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to geocode address. Please check the address and try again.',
                });
            }
        } catch (error) {
            console.error('Geocoding Error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Geocoding service encountered an error. Please try again later.',
            });
        }
    }

    // Create the job with location details
    const job = await Job.create({
        ...jobData,
        address,
        location,
    });

    res.status(200).json({
        success: true,
        message: 'Job Created Successfully.',
        data: job,
    });
});


// Get a specific job with id and slug => '/api/v1/job/:id/:slug'
exports.getJob = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    // console.log(user);

    let jobQuery = Job.find({$and: [{_id: req.params.id}, {slug: req.params.slug}]})
        .populate({
            path: 'user',
            select: 'name'
        });

    if (user.role === 'employer') {
        jobQuery = jobQuery.select('+applicantsApplied');
    }

    const job = await jobQuery;

    if (!job || job.length === 0) {
        return next(new ErrorHandler('Job Not Found.', 404));
    }

    res.status(200).json({
        success: true,
        data: job
    });
});


// Update a Job => '/api/v1/job/:id'
exports.updateJob = catchAsyncErrors(async (req, res, next) => {
    let job = await Job.findById(req.params.id);

    if (!job) {
        return next(new ErrorHandler('Job Not Found.', 404));
    }

    // Checking if the User is the publisher of the job or not
    if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorHandler(`User (${req.user.id}) is not allowed to update this Job.`));
    }

    const { address, ...jobData } = req.body;
    let location = job.location; // Keep existing location by default

    // Geocode the address if it's provided and has changed
    if (address && address !== job.address) {
        try {
            const geocodeResponse = await opencage.geocode({ q: address, key: process.env.OPENCAGE_API_KEY });
            if (geocodeResponse.status.code === 200 && geocodeResponse.results.length > 0) {
                location = {
                    lat: geocodeResponse.results[0].geometry.lat,
                    lng: geocodeResponse.results[0].geometry.lng,
                    formatted: geocodeResponse.results[0].formatted,
                };
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to geocode address. Please check the address and try again.',
                });
            }
        } catch (error) {
            console.error('Geocoding Error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Geocoding service encountered an error. Please try again later.',
            });
        }
    }

    job = await Job.findByIdAndUpdate(
        req.params.id,
        { ...jobData, address, location },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        success: true,
        message: 'Job Is Updated.',
        data: job,
    });
});


// Delete a Job => '/api/v1/job/:id'
exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
    let job = await Job.findById(req.params.id).select('+applicantsApplied');

    if(!job) {
        return next(new ErrorHandler('Job Not Found.', 404));
    }

    // Checking if the User is the publisher of the job or not
    if(job.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorHandler(`User (${req.user.id}) is not allowed to delete this Job.`));
    }

    job = await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Job Is Deleted.'
    });
});


// Get stats about a Topic (Job) => '/api/v1/stats/:topic'
exports.jobStats = catchAsyncErrors(async (req, res, next) => {
    const stats = await Job.aggregate([
        {
            $match: {$text: {$search: "\"" + req.params.topic + "\""}}
            // db.jobs.createIndex({title: "text"}) -> Inside Mongo Console
        },
        {
            $group: {
                _id: {$toUpper: '$experience'},
                totalJobs: {$sum: 1},
                avgPosition: {$avg: 'positions'},
                avgSalary: {$avg: '$salary'},
                minSalary: {$min: '$salary'},
                maxSalary: {$max: '$salary'}
            }
        }
    ]);

    if(stats.length === 0) {
        return next(new ErrorHandler(`No stats found for - ${req.params.topic}`, 200));
    }

    res.status(200).json({
        success: true,
        data: stats
    });
});


// Search jobs within Radius => '/api/v1/jobs/:zipcode/:distance'
// exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
//     const { zipcode, distance } = req.params;

//     // Getting latitude and Logitude from geocoder with zipcode
//     const loc = await geoCoder.geocode(zipcode);

//     const latitude = loc[0].latitude;
//     const longitude = loc[0].longitude;

//     const radius = distance / 3963; // radius of Earth: 3963 miles

//     const jobs = await Job.find({
//         location: {$geoWithin: {$centreSphere: [[longitude, latitude], radius]}}
//     });

//     res.status(200).json({
//         success: true,
//         results: jobs.length,
//         data: jobs
//     });
// });


// Get jobs based on user activity => '/api/v1/jobs/activity'
exports.getActivityJobs = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
  
    let jobs;
    if (user.role === 'user') {
      // Fetch jobs the user has applied to
      jobs = await Job.find({ 'applicantsApplied.id': user.id }).populate({
        path: 'user',
        select: 'name email',
      });
    } else if (user.role === 'employer') {
      // Fetch jobs created by the employer
      jobs = await Job.find({ user: user.id });
    } else {
      return next(new ErrorHandler('Role not authorized for this action.', 403));
    }
  
    if (!jobs || jobs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No jobs found for your activity.',
        data: [],
      });
    }
  
    res.status(200).json({
      success: true,
      results: jobs.length,
      data: jobs,
    });
});


// Apply to job using Resume => '/api/v1/job/:id/apply'
exports.applyJob = catchAsyncErrors(async (req, res, next) => {
    const job = await Job.findById(req.params.id).select('+applicantsApplied');

    if (!job) {
        return next(new ErrorHandler('Job Not Found.', 404));
    }

    // Check if job's last application date has passed
    if (job.lastDate < new Date()) {
        return next(new ErrorHandler('You cannot apply to this job. No longer accepting responses.', 400));
    }

    // Check if the user has already applied to this job
    const hasApplied = job.applicantsApplied.some(applicant => applicant.id === req.user.id);
    if (hasApplied) {
        return next(new ErrorHandler('You have already applied to this job.', 400));
    }

    // Check if the user has selected to use the existing resume
    let resumeUrl;
    if (req.body.useExistingResume === 'true') {
        // If using the existing resume, get the URL from the user's profile
        const user = await User.findById(req.user.id);  // Fix: User model added here
        if (!user || !user.resume) {
            return next(new ErrorHandler('No resume found in your profile.', 400));
        }
        resumeUrl = user.resume;
    } else {
        // If a new resume is uploaded, validate and upload to Cloudinary
        if (!req.file) {
            return next(new ErrorHandler('Please upload a resume file.', 400));
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'job_applications',
        });

        resumeUrl = result.secure_url;
    }

    // Save applicant data to the job
    job.applicantsApplied.push({
        id: req.user.id,
        resume: resumeUrl,
    });

    await job.save();

    res.status(200).json({
        success: true,
        message: 'Applied to Job successfully.',
        resume: resumeUrl, // Return the resume URL
    });
});
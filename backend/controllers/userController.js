const User = require('../models/users');
const Job = require('../models/jobs');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const fs = require('fs').promises;
const path = require('path');
const APIFilters = require('../utils/apiFilters');
const cloudinary = require('../config/cloudinary');


// Get user by ID => '/api/v1/user/:id'
exports.getUserById = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('name email profilePic resume');

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});


// Get Current User Profile => /api/v1/profile
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id)
        .populate({
            path: 'jobsPublished',
            select: 'title postingDate'
        });

    res.status(200).json({
        success: true,
        data: user
    });
});


// Update Current User Password => '/api/v1/password/update'
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Compare previous user password
    const isMatched = await user.comparePassword(req.body.currentPassword);

    if (!isMatched) {
        return next(new ErrorHandler('Old Password is incorrect.', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});


// Delete current user => '/api/v1/profile/delete'
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {

    // delete user data
    deleteUserData(req.user.id, req.user.role);

    const user = await User.findByIdAndDelete(req.user.id);

    // setting the cookie to none (as user's account is no more)
    res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Your account has been deleted.'
    });
});


// Deleting files associated with user (user-resume and employer-jobs)
async function deleteUserData(user, role) {
    if (role === 'employer') {
        // deleting all the job postings posted with id 'user'
        await Job.deleteMany({ user: user });
    }

    if (role === 'user') {
        // finding all the jobs that the user has applied to...
        const appliedJobs = await Job.find({ 'applicantsApplied.id': user }).select('+applicantsApplied');

        for (const job of appliedJobs) {
            // finding the 'user object {id, resume}' in each job in which they have applied...
            let obj = job.applicantsApplied.find(o => o.id === user);

            const filepath = path.join(__dirname, '../public/uploads', obj.resume);

            fs.unlink(filepath, err => {
                if (err) {
                    return console.log(err);
                }
            });

            const index = job.applicantsApplied.indexOf(obj.id);
            job.applicantsApplied.splice(index);

            await job.save();
        }
    }
}


// Show all applied jobs => '/api/v1/jobs/applied'
exports.getAppliedJobs = catchAsyncErrors(async (req, res, next) => {

    // finding all the jobs that the user has applied to...
    const jobs = await Job.find({ 'applicantsApplied.id': req.user.id }).select('+applicantsApplied');

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    });
});


// Show all jobs published by the Employer => '/api/v1/jobs/published'
exports.getPublishedJobs = catchAsyncErrors(async (req, res, next) => {

    // finding all the jobs that the employer has published...
    const jobs = await Job.find({ user: req.user.id });

    res.status(200).json({
        success: true,
        results: jobs.length,
        data: jobs
    });
});


// Route for updating profile details (name, email, and profile picture) => '/api/v1/profile/update'
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found.', 404));
    }

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    // Handle profile picture upload if provided
    if (req.file) { // Check if profilePicture is uploaded
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile_pics',
            width: 150,
            crop: 'scale',
        });

        // If the user already has a profile picture, delete the old one from Cloudinary
        if (user.profilePic) {
            const publicId = user.profilePic.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        newUserData.profilePic = result.secure_url;
    }

    // Update user profile in the database
    const updatedUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    // Respond with the updated user data
    res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updatedUser,
    });
});

// Route for uploading or updating resume => '/api/v1/user/resume'
exports.uploadResume = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found.', 404));
    }

    if (req.file) { // Check if a resume is uploaded
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'resumes', // Cloudinary folder for resumes
            resource_type: 'raw', // Upload resume as raw type (non-image)
        });

        // If the user already has a resume, delete the old one from Cloudinary
        if (user.resume) {
            const publicId = user.resume.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        // Update resume URL
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { resume: result.secure_url },
            { new: true, runValidators: true, useFindAndModify: false }
        );

        // Respond with the updated user data
        return res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully.',
            data: updatedUser,
        });
    } else {
        return next(new ErrorHandler('No resume uploaded.', 400));
    }
});


// Adding controller methods that are only accessible by "Admins"

// Show all users => '/api/v1/users'
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
    const apiFilters = new APIFilters(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();

    const users = await apiFilters.query;

    res.status(200).json({
        success: true,
        results: users.length,
        data: users
    });
});


// Delete User(Admin) => /api/v1/user/:id
exports.deleteUserAdmin = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    deleteUserData(user.id, user.role);
    await User.deleteOne({ _id: user.id });

    res.status(200).json({
        success: true,
        message: 'User is deleted by Admin.'
    });
});
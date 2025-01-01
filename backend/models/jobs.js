const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter Job title.'],
        trim: true,
        maxlength: [100, 'Job title cannot exceed 100 characters.']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please enter Job description.'],
        maxlength: [1000, 'Job description cannot exceed 1000 characters.']
    },
    email: {
        type: String,
        validate: [validator.isEmail, 'Please enter a valid email address.']
    },
    address: {
        type: String,
        required: [true, 'Please add an address.']
    },
    location: {
        lat: { type: Number },          // Latitude from OpenCage
        lng: { type: Number },          // Longitude from OpenCage
        formatted: { type: String },    // Formatted address from OpenCage
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    company: {
        type: String,
        required: [true, 'Please add the Company name.']
    },
    industry: {
        type: [String],
        required: true,
        enum: {
            values: [
                'Business',
                'Information Technology',
                'Banking',
                'Education/Training',
                'Telecommunication',
                'Others'
            ],
            message: 'Please select the Industry.'
        }
    },
    jobType: {
        type: String,
        required: [true, 'Please enter the Job Type.'],
        enum: {
            values: [
                'Permanent',
                'Temporary',
                'Internship'
            ],
            message: 'Please select a Job type.'
        }
    },
    minEducation: {
        type: String,
        required: [true, 'Please enter Minimum Education.'],
        enum: {
            values: [
                'High School',
                'Bachelors',
                'Masters',
                'Phd'
            ],
            message: 'Please select the Education.'
        }
    },
    positions: {
        type: Number,
        default: 1
    },
    experience: {
        type: String,
        required: [true, 'Please enter Experience Required.'],
        enum: {
            values: [
                '0 Years / Fresher',
                '1 Year - 2 Years',
                '2 Years - 5 Years',
                'More than 5 Years'
            ],
            message: 'Please select the Experience.'
        }
    },
    salary: {
        type: Number,
        required: [true, 'Please enter the Expected Salary.']
    },
    postingDate: {
        type: Date,
        default: Date.now
    },
    lastDate: {
        type: Date,
        default: new Date().setDate(new Date().getDate() + 7)
    },
    applicantsApplied: {
        type: [Object],
        select: false   // It hides this field from normal users
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

// Creating Job Slug before saving it
jobSchema.pre('save', function (next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});

// Setting up Location
// jobSchema.pre('save', async function(next) {
//     const loc = await geoCoder.geocode(this.address);

//     this.location = {
//         type: 'Point',
//         coordinates: [loc[0].longitude, loc[0].latitude],
//         formattedAddress: loc[0].formattedAddress,
//         city: loc[0].city,
//         state: loc[0].stateCode,
//         zipcode: loc[0].zipcode,
//         country: loc[0].countryCode
//     }

//     next();
// });

module.exports = mongoose.model('Job', jobSchema);
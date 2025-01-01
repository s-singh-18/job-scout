const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const connectDatabase = async () => {
    try {
        const con = await mongoose.connect(process.env.DB_URI);
        console.log(`MongoDB connected with host: ${con.connection.host}`);
    } catch (err) {
        console.error(`Connection Error: ${err.message}`);
        process.exit(1);  // Exit on connection error
    }
};

module.exports = connectDatabase;
require('dotenv').config();
const { connect } = require('mongoose');
const mongoString = process.env.DATABASE_URL;

const connectDB = async () => {
    try {
        await connect(mongoString);
        console.log('Database Connected.')
    } catch (error) {
        console.log(error)
    }

};

module.exports = { connectDB }


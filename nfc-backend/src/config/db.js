const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("1");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("2");
        console.log('MongoDB Connected');
        console.log("3");

    } catch (err) {
        console.log("4");
        console.error(err);
        console.log("5");
        process.exit(1);
        console.log("6");
    }
};

module.exports = connectDB;
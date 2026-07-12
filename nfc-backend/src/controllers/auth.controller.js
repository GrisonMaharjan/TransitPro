const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

exports.register = async (req, res) => {
    try {
        const {
            name,
            mobileNumber,
            email,
            password
        } = req.body;

        console.log(`--- Registration Attempt: ${email} ---`);

        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log(`❌ Registration Failed: User ${email} already exists.`);
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique UserId and NFCID
        const userId = 'USR-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const nfcUid = 'NFC-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        const user = await User.create({
            userId,
            name,
            mobileNumber,
            email,
            password: hashedPassword,
            nfcUid
        });

        console.log(`✅ Registration Successful: ${user.name} (${user.email})`);
        console.log(`Stored in collection: ${User.collection.name}`);
        console.log(`User IDs: ${user.userId}, ${user.nfcUid}`);

        res.json({
            _id: user._id,
            userId: user.userId,
            nfcUid: user.nfcUid,
            name: user.name,
            mobileNumber: user.mobileNumber,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('❌ Registration Error:', error.message);
        res.status(500).json({
            message: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            userId: user.userId,
            nfcUid: user.nfcUid,
            name: user.name,
            mobileNumber: user.mobileNumber,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const saltRounds = 10;

// Create a user
router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.find({ username: username });

        if (user.length)
            return res.json({
                message: `User with username '${username}' is already exist.`
            });

        const hash = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            password: hash
        });

        const savedUser = await newUser.save();

        const token = jwt.sign(JSON.stringify(savedUser), process.env.JWT_SECRET_KEY);

        res.json({
            message: 'User has been successfully created.',
            token
        });
    } catch(error) {
        res.json({
            message: error
        })
    }
});

router.get('/validateToken', async (req, res) => {
    const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    try {
        const token = req.header(tokenHeaderKey);
        const tokenIsVerified = jwt.verify(token, jwtSecretKey);
        
        if (tokenIsVerified) {
            res.json({
                message: 'Token has been successfully verified.'
            });
        } else {
            res.status(401).json({
                message: "Token was not verified."
            });
        }
    } catch (error) {
        res.status(401).json({
            message: error
        });
    }
});

module.exports = router;
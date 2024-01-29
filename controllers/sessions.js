const express = require("express")
const User = require("../models/User.js")
const sessionRouter = express.Router()
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

//ROUTES

//C
//login 
sessionRouter.post("/", (req, res) => {
    //Check for an existing user 
    User.findOne({
        $or: [{ username: req.body.username.toLowerCase() }, { email: req.body.username.toLowerCase() }]
    }, (err, foundUser) => {
        //send error if no user registered
        if (!foundUser) {
            res.status(401).json("Invalid username or email")
        } else {
            //if the user is found, compare the given password with the hashed password
            const passwordMatches = bcrypt.compareSync(req.body.password, foundUser.password);
            if (passwordMatches) {
                const accessToken = jwt.sign(
                    { user_id: foundUser._id },
                    process.env.ACCESS_TOKEN_KEY,
                    { expiresIn: "10m", }
                );
                const refreshToken = jwt.sign(
                    { user_id: foundUser._id },
                    process.env.REFRESH_TOKEN_KEY,
                    { expiresIn: "7d", }
                );
                res.cookie('jwta', accessToken, {
                    httpOnly: true,
                    sameSite: 'None', secure: true,
                    maxAge: 10 * 60 * 1000 //10 mins
                });
                res.cookie('jwtr', refreshToken, {
                    httpOnly: true,
                    sameSite: 'None', secure: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
                });
                // save user token
                foundUser.accessToken = accessToken;
                foundUser.refreshToken = refreshToken;
                let tempUser = foundUser
                tempUser.highscores = {
                    hse30: foundUser.highscores.hse30,
                    hsm60: foundUser.highscores.hsm60,
                    hsh120: foundUser.highscores.hsh120,
                }
                foundUser.save()
                res.status(200).json({
                    email: tempUser.email,
                    username: tempUser.username,
                    highscores: tempUser.highscores,
                    _id: tempUser._id,
                })
            } else {
                //if the passwords don't match
                res.status(401).json("Incorrect password")
            };
        };
    });
});

// REFRESH TOKEN
sessionRouter.post("/refresh", (req, res) => {
    const refreshToken = req.cookies?.jwtr;
    // Verify the refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(403).json("Your session has expired. Please sign in again.") // Forbidden if refresh token is invalid
        }
        User.findById(req.body._id, (err, foundUser) => {
            if (!foundUser) {
                res.status(403).json("Something is wrong! Please sign in again.")
            } else {
                // Issue a new access token
                const accessToken = jwt.sign(
                    { user_id: foundUser._id },
                    process.env.ACCESS_TOKEN_KEY,
                    { expiresIn: "10m", }
                );
                const refreshToken = jwt.sign(
                    { user_id: foundUser._id },
                    process.env.REFRESH_TOKEN_KEY,
                    { expiresIn: "7d", }
                );
                res.cookie('jwta', accessToken, {
                    httpOnly: true,
                    sameSite: 'None', secure: true,
                    maxAge: 10 * 60 * 1000 //10 mins
                });
                res.cookie('jwtr', refreshToken, {
                    httpOnly: true,
                    sameSite: 'None', secure: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
                });
                foundUser.accessToken = accessToken
                foundUser.refreshToken = refreshToken
                foundUser.save()
                res.status(200).json("Token refreshed.")
            }
        });
    });
});
//Check for an existing user 
        // console.log(auth())
        // to post new score or update score
        // maybe refresh onclick postscore?
        // refresh on invalid token error
        // try for access token if error, refresh and then try again.
        // refresh will be done on clientside
        // after you get the user, you get the refresh token from their database
        // then you verify the token, and then issue new access and new refresh tokens
        // then again on invalid token error, refresh
        // cycle continues until sign out (then new token will be give on sign in)
        // or until refresh token expires. 7d
        //send error if no user registered

module.exports = sessionRouter;

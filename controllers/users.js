const express = require("express")
const User = require("../models/User.js")
const userRouter = express.Router()
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth.js")
const Filter = require("bad-words");
const Highscore = require("../models/Highscore.js");
const filter = new Filter;
const jwt = require("jsonwebtoken")

//Logout
userRouter.get('/logout', (req, res) => {
    res.clearCookie('jwta', { path: '/', secure: true, sameSite: 'None' });
    res.clearCookie('jwtr', { path: '/', secure: true, sameSite: 'None' });
    res.status(200).json("Logged out")
});

//Update
//Update highscore
userRouter.put("/", auth, (req, res) => {
    User.findById(req.body._id, (err, foundUser) => {
        if (foundUser) {
            foundUser.highscores[req.body.gameSetting] = req.body.value
            foundUser.save(err => {
                res.status(200).json("High score saved!")
            })
        } else {
            res.status(400).json("Something went wrong")
        }
    })
})

//Delete
//Delete user
userRouter.delete("/", auth, (req, res) => {
    User.findByIdAndDelete(req.body._id, (err, deletedUser) => {
        if (err) {
            res.status(400).json("Something went wrong")
        } else {
            Highscore.deleteMany({ username: req.body.username }, (err, deletedScores) => { })
            res.status(200).json("Deleted User")
        }
    })
})

//Create
//Create new user
userRouter.post("/", (req, res) => {
    let filteredName = req.body.username.replace(/\s/g, "")
    if (!req.body.email.includes("@") || !req.body.email.includes(".com")) {
        res.status(400).json("Email must include @ and .com")
    } else if (req.body.username.length > 20) {
        res.status(400).json("Username must be less than 20 characters")
    } else if (filter.isProfane(filteredName)) {
        res.status(400).json("Please choose a different username")
    } else if (req.body.password.length < 8) {
        res.status(400).json("Password must be at least 8 characters")
    } else {
        User.findOne({
            $or: [{ username: req.body.username.toLowerCase() }, { email: req.body.email.toLowerCase() }]
        }, (err, foundUser) => {
            //If no user is found with that username
            if (!foundUser) {
                //overwrite the user password with hashed password, then pass that in to our database
                req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                User.create({
                    email: req.body.email.toLowerCase(),
                    username: req.body.username.toLowerCase(),
                    password: req.body.password
                }, (err, createdUser) => {
                    if (err) {
                        console.log(err)
                    } else {
                        res.status(200).json("User created")
                    }
                });
            } else if (foundUser.username.toLowerCase() === req.body.username.toLowerCase()) {
                res.status(400).json("Username in use")
            } else if (foundUser.email.toLowerCase() === req.body.email.toLowerCase()) {
                res.status(400).json("Email in use")
            };
        })
    }
})

//forgot password
userRouter.put("/forgot-password", (req, res) => {
    console.log("TESTING FORGOT PASSWORD")
    const accessToken = jwt.sign(
        // { user_id: foundUser._id },
        { user_id: req.body._id },
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: "1h", }
    );
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: `${process.env.EMAIL_ADDRESS}`,
    //         pass: `${process.env.EMAIL_PASSWORD}`,
    //     },
    // });

    // const mailOptions = {
    //     from: 'info@numerogame.com',
    //     to: req.body.username,
    //     // to: `${user.email}`,
    //     subject: 'Numero - Link To Reset Password',
    //     text:
    //         'You are receiving this because you (or someone else) have requested to reset the password for your Numero account.\n\n'
    //         + 'Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n'
    //         + `http://localhost:3001/profile/forgot-password/?token=${accessToken}&_id=${req.body._id}\n\n`
    //         + 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
    // };
    // console.log('sending mail');

    // transporter.sendMail(mailOptions, (err, response) => {
    //     if (err) {
    //         console.error('there was an error: ', err);
    //         res.status(401).json("Something's wrong")
    //     } else {
    //         res.status(200).json('recovery email sent');
    //     }
    // });
    // User.findById(req.body._id, (err, foundUser) => {
    //     if (err) {
    //         res.status(401).json("Email not found")
    //     } else {
    //         //SEND EMAIL CONTAINING FORGOT PASSWORD LINK
    //         res.status(200).json("Found user!")
    //     }
    // })
})

//change password
userRouter.put("/change-password", auth, (req, res) => {
    if (req.body.newPassword.length < 8) {
        res.status(401).json("Password must be at least 8 characters")
    } else {
        const userId = req.body._id || req.query._id;
        //Check for an existing user 
        User.findById(userId, (err, foundUser) => {
            //send error if no user registered
            if (err) {
                res.status(401).json("Something's wrong")
            } else {
                let passwordMatches = false;
                if (req.body._id) {
                    passwordMatches = bcrypt.compareSync(req.body.password, foundUser.password);
                } else if (req.query._id) {
                    passwordMatches = true;
                }
                //if the user is found, compare the given password with the hashed password
                if (passwordMatches) {
                    const newPassword = bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync(10));
                    // save user token
                    foundUser.password = newPassword;
                    foundUser.save()
                    res.status(200).json("Password sucessfully changed")
                } else {
                    //if the passwords don't match
                    res.status(401).json("Incorrect password")
                };
            };
        });
    }
})

module.exports = userRouter;
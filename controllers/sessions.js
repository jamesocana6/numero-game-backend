const express = require("express")
const User = require("../models/User")
const sessionRouter = express.Router()
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const auth = require("../middleware/auth")

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
            res.json("Invalid username or email")
        } else {
            //if the user is found, compare the given password with the hashed password
            const passwordMatches = bcrypt.compareSync(req.body.password, foundUser.password);
            if (passwordMatches) {
                const token = jwt.sign(
                    { user_id: foundUser._id },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "7d",
                    }
                );
                // save user token
                foundUser.token = token;
                let tempUser = foundUser
                foundUser.save()
                res.json({
                    _id: tempUser._id,
                    email: tempUser.email,
                    username: tempUser.username,
                    tkni: Date.now(),
                    tknr: Date.now()+(1000*60*60*24*6),
                    tkne: Date.now()+(1000*60*60*24*7),
                    token: tempUser.token,
                    highscores: tempUser.highscores,
                })
            } else {
                //if the passwords don't match
                res.json("Incorrect password")
            };
        };
    });
});

// REFRESH TOKEN
sessionRouter.post("/refresh", auth, (req, res) => {
    //Check for an existing user 
    User.findById(req.body._id, (err, foundUser) => {
        //send error if no user registered
        const token = jwt.sign(
            { user_id: foundUser._id },
            process.env.TOKEN_KEY,
            {
                expiresIn: "7d",
            }
        );
        // save user token
        foundUser.token = token;
        let tempUser = foundUser
        foundUser.save()
        res.json({
            _id: tempUser._id,
            email: tempUser.email,
            username: tempUser.username,
            tkni: Date.now(),
            tknr: Date.now()+(1000*60*60*24*6),
            tkne: Date.now()+(1000*60*60*24*7),
            token: tempUser.token,
            highscores: tempUser.highscores,
        })

    });

});


module.exports = sessionRouter;

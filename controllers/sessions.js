const express = require("express")
const User = require("../models/user")
const sessionRouter = express.Router()
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const auth = require("../middleware/auth")

//ROUTES

//D
//logout

//C
//login 
sessionRouter.post("/", (req, res) => {
    //Check for an existing user 
    User.findOne({
        $or: [{ username: req.body.username.toLowerCase() }, { email: req.body.username.toLowerCase() }]
    }, (err, foundUser) => {
        //send error if no user registered
        if (!foundUser) {
            res.status(418)
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
                res.json(foundUser)
            } else {
                //if the passwords don't match
                res.status(418)
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
        res.json(foundUser)
    });

});


module.exports = sessionRouter;

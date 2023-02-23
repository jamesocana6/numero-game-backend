const express = require("express")
const User = require("../models/user")
const sessionRouter = express.Router()
const bcrypt = require("bcrypt");

//ROUTES

//D
//logout
sessionRouter.delete('/', (req, res) => {
    req.session.destroy((err) => {
        res.json({"message": "logout"});
    });
});

//C
//login 
sessionRouter.post("/", (req, res) => {
    //Check for an existing user 
    User.findOne({
        username: req.body.username
    }, (err, foundUser) => {
        //send error if no user registered
        if (!foundUser) {
            res.status(418).json({"error": "No user with that username is registered."});
        } else {
            //if the user is found, compare the given password with the hashed password
            const passwordMatches = bcrypt.compareSync(req.body.password, foundUser.password);
            if (passwordMatches) {
                //add the user to the session
                req.session.currentUser = foundUser;
                res.json(req.session.currentUser)
            } else {
                //if the passwords don't match
                res.status(418).json({"error": "Invalid credentials."});
            };
        };
    });
});


module.exports = sessionRouter;

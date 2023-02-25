const express = require("express")
const User = require("../models/user")
const sessionRouter = express.Router()
const bcrypt = require("bcrypt");

//ROUTES

//D
//logout
sessionRouter.delete('/', (req, res) => {
    console.log("signout",req.session.currentUser)
    req.session.destroy((err) => {
        res.json({"message": "logout"});
    });
});

//C
//login 
sessionRouter.post("/", (req, res) => {
    //Check for an existing user 
    console.log("GOING TO SGN YOU IN")
    User.findOne({
        $or: [{username: req.body.username.toLowerCase()}, {email: req.body.username.toLowerCase()}]
    }, (err, foundUser) => {
        //send error if no user registered
        if (!foundUser) {
            console.log("NO FOUND")
            res.status(418)
        } else {
            console.log("FOUND YOU", foundUser)
            //if the user is found, compare the given password with the hashed password
            const passwordMatches = bcrypt.compareSync(req.body.password, foundUser.password);
            if (passwordMatches) {
                console.log("Passwords match")
                //add the user to the session
                req.session.currentUser = foundUser;
                console.log(req.session)
                console.log(req.sessionID)
                res.json(req.session.currentUser)
            } else {
                //if the passwords don't match
                res.status(418)
            };
        };
    });
    
});


module.exports = sessionRouter;

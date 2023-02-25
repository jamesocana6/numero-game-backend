const express = require("express")
const User = require("../models/user")
const userRouter = express.Router()
const bcrypt = require("bcrypt");

//Index
userRouter.get("/", (req, res) => {
    console.log(req.headers)
    console.log(req.sessionID)
    console.log(req.sessionStore)
    if (req.session.currentUser) {
        User.findById(req.session.currentUser._id, (err, foundUser) => {
            //If no user is found with that username
            if (foundUser) {
                res.json(foundUser)
            } else {
                res.status(418)
            }
        })
    } else {
        res.status(418)
    }
})


//New

//Delete

//Update
//Update highscore
userRouter.put("/", (req, res) => {
    console.log(req.body)
    console.log(req.session)
    if (req.session.currentUser) {
        User.findById(req.session.currentUser._id, (err, foundUser) => {
            //If no user is found with that username
            if (foundUser) {
                console.log(foundUser, "FOUND")
                foundUser.highscores[req.body.gameSetting] = req.body.value
                req.session.currentUser = foundUser
                console.log(req.session.currentUser)
                foundUser.save(err => {res.json(foundUser)})
            } else {
                console.log("NOT FOUND")
                res.status(418)
            }
        })
    } else {
        res.status(418)
    }
})

userRouter.put("/clearhighscores", (req, res) => {
    User.findById(req.session.currentUser._id, (err, foundUser) => {
        //If no user is found with that username
        if (foundUser) {
            foundUser.highscores = { 
                hs24e30: 0, 
                hs24m60: 0, 
                hs24h120: 0, 
                hs48e30: 0, 
                hs48m60: 0, 
                hs48h120: 0, 
                hs60e30: 0, 
                hs60m60: 0, 
                hs60h120: 0, 
            }
            req.session.currentUser = foundUser
            foundUser.save(er => res.json(foundUser))
        } else {
            res.status(418)
        }
    })
})



//Create
//Create new user
userRouter.post("/", (req, res) => {
    User.findOne({ 
        $or: [{username: req.body.username.toLowerCase()}, {email: req.body.email.toLowerCase()}]
    }, (err, foundUser) => {
        //If no user is found with that username
        if (!foundUser) {
            //overwrite the user password with hashed password, then pass that in to our database
            req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
            res.json(User.create({
                email: req.body.email.toLowerCase(),
                username: req.body.username.toLowerCase(),
                password: req.body.password
            }));
        } else if (foundUser.username.toLowerCase() === req.body.username.toLowerCase()) {
            res.status(418).json({"error": "Username in use!"});
        } else if (foundUser.email.toLowerCase() === req.body.email.toLowerCase()) {
            res.status(418).json({"error": "Email in use!"});
        } ;
    })
})

//Edit

//Show
//Show user??

module.exports = userRouter;
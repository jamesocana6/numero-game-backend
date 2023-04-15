const express = require("express")
const User = require("../models/User.js")
const userRouter = express.Router()
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth.js")
const Filter = require("bad-words");
const filter = new Filter;

//Update
//Update highscore
userRouter.put("/", auth,(req, res) => {
    User.findById(req.body._id, (err, foundUser) => {
        //If no user is found with that username
        if (foundUser) {
            foundUser.highscores[req.body.gameSetting] = req.body.value
            foundUser.save(err => {
                res.json("High score posted!")
            })
        } else {
            res.json("Something went wrong")

        }
    })
})

//Create
//Create new user
userRouter.post("/", (req, res) => {
    let filteredName = req.body.username.replace(/\s/g,"")
    if (!req.body.email.includes("@") || !req.body.email.includes(".com")) {
        res.json("Email must include @ and .com")
    } else if (req.body.username.length > 20) {
        res.json("Username must be less than 20 characters")
    } else if (filter.isProfane(filteredName)) {
        res.json("Please choose a different username")
    } else if (req.body.password.length < 8) {
        res.json("Password must be at least 8 characters long")
    } else {    
        User.findOne({ 
            $or: [{username: req.body.username.toLowerCase()}, {email: req.body.email.toLowerCase()}]
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
                        let tempUser = createdUser
                        res.json({
                            _id: tempUser._id,
                            email: tempUser.email,
                            username: tempUser.username,
                            highscores: tempUser.highscores,
                        })
                    }
                });
            } else if (foundUser.username.toLowerCase() === req.body.username.toLowerCase()) {
                res.json("Username in use")
            } else if (foundUser.email.toLowerCase() === req.body.email.toLowerCase()) {
                res.json("Email in use")
            };
        })
    }
})

module.exports = userRouter;
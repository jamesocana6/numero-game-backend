const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const userController = require("./controllers/users");
const highscoreController = require("./controllers/highscores");
const sessionController = require("./controllers/sessions");

//Connect MongoDB
mongoose.connect(process.env.DATABASE_URL);

//MIDDLEWARE 
app.use(cors({ credentials: true, origin: true })); //prevent cors errors, open acces to all origins
app.use(express.json()); //parse json bodies
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use("/user", userController)
app.use("/highscore", highscoreController)
app.use("/signin", sessionController)

//ROUTE
app.get("/", (req, res) => {
    res.send("HELLO");
});

//database connection error / success
const db = mongoose.connection;
db.on("error", (err) => console.log(err.message + "we got an error connecting the DB"));
db.on("connected", () => console.log("mongo connected"));
db.on("disconnected", () => console.log("mongo disconnected"));

app.listen(PORT, (req, res) => {
    console.log("hello there!");
});
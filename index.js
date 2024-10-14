const express = require("express");
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const userController = require("./controllers/users.js");
const highscoreController = require("./controllers/highscores.js");
const sessionController = require("./controllers/sessions.js");
const cookieParser = require("cookie-parser");
const server = createServer(app);
const io = new Server(server, {cors: 
    {
        origin: "http://localhost:3000"
    }
});

server.listen(3005, (req, res) => {
    console.log('connected socket on 3005')
})

// Connect and disconnect Socket.io
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

//Connect MongoDB
mongoose.connect(process.env.DATABASE_URL);

//MIDDLEWARE 
app.use(cors({ credentials: true, origin: ["https://computiles.com", "http://localhost:3000"] })); //prevent cors errors, open access to all origins
app.use(express.json()); //parse json bodies
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(cookieParser())

app.use("/user", userController)
app.use("/highscore", highscoreController)
app.use("/signin", sessionController)

//ROUTE
app.get("/", (req, res) => {
    res.send("HELLO WORLD");
});

//database connection error / success
const db = mongoose.connection;
db.on("error", (err) => console.log(err.message + "we got an error connecting the DB"));
db.on("connected", () => console.log("mongo connected"));
db.on("disconnected", () => console.log("mongo disconnected"));

app.listen(PORT, (req, res) => {
    console.log("hello there!");
});

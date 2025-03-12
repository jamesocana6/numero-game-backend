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

// do i need to track the players in every room? 
// how will the players in a room know what move is being made by the other?
// are moves saved from previous sockets??
// Disconnect when going to the main menu page
// Disconnect when closing the page
// disconnect when inactive
// persist socket connection when navigating to a new multiplayer room

/* TODO
- disconnect when inactive
    - set up inactivity timer 5mins?
    - add lastActive time to room
    - maybe we can remove the need to check the rooms for another person
*/

/*
Flow:
1. Player joins the server by clicking Online => 
    Player connects to the socket is added to the array of players.
2. Two choices, "find random opponent" or "create room"
    "Find random opponent" adds them to another array of players and if there are 2 players, it matches them
        Loading Screen (waiting for opponent)
        Matched players join a room and the game starts
    "Create Room" creates a room with a generated code
        Loading Screen (waiting for opponent)
        send player to a new room with new url
        code is shared with the player in the form of a url link
        link connects other players to this game
        *How many people can play in one room?*
3. Play game when 2 players are in 1 room and they click start
    Click start => send "start game"
    *How does start game work?*
    Each move sends a "new move" which updates the values of the tiles
*/

let users = new Set();
let activeRooms = new Map();
let unmatchedPlayers = [];

function cleanRooms(socket) {
    for (const [room, roomData] of activeRooms.entries()) {
        if (roomData.hasOwnProperty(socket.id)) {
            delete roomData[socket.id]
        }
        // If the room is empty after removal, delete the room itself
        if (Object.keys(roomData).length === 0) {
            activeRooms.delete(room);
        }
        break; // Exit loop after removing the player
    }
}

const generateSecureRoomCode = () => {
    return [...Array(8)]
        .map(() => Math.random().toString(36)[2]) // Picks a random letter/number
        .join("")
        .toUpperCase();
};

class Player {
    constructor(clickedTiles, numTiles, opUsed, ready, score, username) {
        this.clickedTiles = clickedTiles || []
        this.numTiles = numTiles || []
        this.opUsed = opUsed || []
        this.ready = ready || false
        this.score = score || 0
        this.username = username || null
    }

    updateNumTiles({clickedTiles, numTiles, opUsed, score}) {
        this.clickedTiles = clickedTiles;
        this.numTiles = numTiles;
        this.opUsed = opUsed;
        this.score = score;
    }
}

// Connect and disconnect Socket.io
io.on('connection', (socket) => {
    socket.on("join server", () => {
        users.add(socket.id); // Ensures uniqueness
        console.log("users", [...users]); // Convert Set to array for logging
        io.emit("online players", users.size); // Send count
    });

    socket.on("disconnect", () => {
        users.delete(socket.id); // Remove user
        cleanRooms(socket);
        io.emit("online players", users.size);
    });
    socket.on('join room', ({room, maxPlayers = 2, username}) => {
        // we can have a flag here that will allow random people
        //  click a check box that says, random opponent
        //  check the flag in this function
        //  add the player to an array unmatchedRooms
        // we can make it so there is a separate button to join the random pool
        //  i think this makes the most sense because if 2 players create a room
        //  and allow matching with random players, whos room will take priority?
        //  click find random opponent 
        //  if theres no unmatched players and make a new room
        //  if there are unmatched players, pop the first room and join
        const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
        username = username || `Player ${roomSize + 1}`
        if (roomSize === maxPlayers) {
            socket.emit("room full")
        } else {
            socket.join(room);
            // move room here and then add players
            if (!activeRooms.has(room)) {
                activeRooms.set(room, {
                    [socket.id]: new Player([], [], [], false, 0, username)
                })
            } else {
                activeRooms.get(room)[socket.id] = new Player([], [], [], false, 0, username)
            }
            const players = Object.values(activeRooms.get(room)).map((player) => ({ready: player.ready, username: player.username}))
            io.to(room).emit("user joined", {players});
        }
        console.log('activeRooms', activeRooms)
    });
    // socket.on('quick match', ({username}) => {
    //     if (unmatchedRooms.length > 0) {
    //         const room = unmatchedRooms.pop()
    //         socket.join(room)
    //         username = username || "Player 2"
    //         activeRooms.get(room)[socket.id] = new Player([], [], [], false, 0, username)
    //         const players = Object.values(activeRooms.get(room)).map((player) => ({ready: player.ready, username: player.username}))
    //         io.to(room).emit("user joined", {players});
    //     } else {
    //         const roomCode = generateSecureRoomCode()
    //         const room = `rand_${roomCode}`;
    //         socket.join(room);
    //         username = username || "Player 1"
    //         unmatchedRooms.push(room);
    //         activeRooms.set(room, {
    //             [socket.id]: new Player([], [], [], false, 0, username)
    //         })
    //         const players = Object.values(activeRooms.get(room)).map((player) => ({ready: player.ready, username: player.username}))
    //         io.to(room).emit("user joined", {players});
    //     }
    //     console.log('unmatchedRooms', unmatchedRooms)
    //     console.log('activeRooms', activeRooms)
    // });
    socket.on('ready', ({room}) => {
        const roomData = activeRooms.get(room)
        roomData[socket.id].ready = true
        const allReady = Object.values(roomData).every(player => player.ready);
        const players = Object.values(roomData).map(player => ({ready: player.ready, username: player.username}));
        if (allReady && Object.keys(roomData).length > 1) {
            io.to(room).emit("player ready", {players});
            io.to(room).emit("game start");
        } else {
            io.to(room).emit("player ready", {players});
        }
    })
    socket.on('leave room', (room) => {
        socket.leave(room);
        cleanRooms(socket);
        io.to(room).emit("a new user has left the room");
    }); 

    // Handle random opponent search
    // we want to do find opponennt like this because it is hidden from the front end
    // i dont think we need to change how we do create game 
    socket.on('quick match', ({username}) => {
        if (unmatchedPlayers.length > 0) {
            const opponent = unmatchedPlayers.pop(); // Match with the first available player
            const {username: oppUsername, socket: {id: oppSocketId}} = opponent
            const room = `game_${socket.id}_${opponent.socket.id}`; // Unique room name
            socket.join(room);
            opponent.socket.join(room);
            username = username || "Player 2"
            // Notify both players
            const players = {
                [socket.id]: new Player([], [], [], false, 0, username),
                [oppSocketId]: new Player([], [], [], false, 0, oppUsername),
            }
            activeRooms.set(room, players)
            io.to(room).emit("user joined", {players: [
                {ready: false, username, socketId: socket.id},
                {ready: false, username: oppUsername, socketId: oppSocketId},
            ]})
        } else {
            username = username || "Player 1"
            unmatchedPlayers.push({socket, username});
            socket.emit('waiting', 'Waiting for an opponent...');
        }
        console.log('unmatchedPlayers', unmatchedPlayers)
        console.log('activeRooms', activeRooms)
    });
    // on leave lobby, you should remove the socket from the array
    socket.on('findOpponent', () => {
            const room = `game_${socket.id}}`; // Unique room name
            socket.join(room);
            socket.emit('waiting', 'Waiting for an opponent...');
            
            // // Notify both players
            // io.to(room).emit('startGame', { room });
            // console.log(`Game started between ${socket.id} and ${opponent.id} in room: ${room}`);
            // unmatchedPlayers.push(socket);
    });

    // // Handle joining via hash/code
    // socket.on('joinGame', (roomCode) => {
    //     const room = `game_${roomCode}`;
    //     const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

    //     if (roomSize === 0) {
    //         socket.join(room);
    //         socket.emit('waiting', 'Waiting for an opponent...');
    //     } else if (roomSize === 1) {
    //         socket.join(room);
    //         io.to(room).emit('startGame', { room });
    //         console.log(`Game started in room: ${room}`);
    //     } else {
    //         socket.emit('error', 'Room is full or invalid');
    //     }
    // });

    // // Handle disconnection
    // socket.on('disconnect', () => {
    //     console.log('A user disconnected');
    //     unmatchedPlayers = unmatchedPlayers.filter((player) => player.id !== socket.id);
    // });
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

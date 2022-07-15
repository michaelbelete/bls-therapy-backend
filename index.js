const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const crypto = require("crypto");

const rooms = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client.html');
});

io.on('connection', (socket) => {
    socket.on("create session", () => {
        const sessionId = crypto.randomBytes(10).toString("hex");
        const newRoom = {
            sessionId: sessionId,
            config: {
                isBouncing: false,
                bgColor: '#ef4444',
                speed: 2,
            }
        }
        rooms.push(newRoom);
        io.emit('create session', newRoom);
    })

    socket.on("join session", (sessionId) => {

        const checkSessionExist = rooms.find(room => room.sessionId === sessionId);

        if (!checkSessionExist) {
            io.emit("join session", "session doesn\'t exist!!");
        }

        io.emit('join session', checkSessionExist);
    })

    socket.on("get config", (sessionId) => {
        const sessionConfig = rooms.find(room => room.sessionId === sessionId);
        io.to(sessionId).emit("get config", {
            sessionConfig
        })
    });

    socket.on("set config", ({ sessionId, config }) => {
        const sessionIndex = rooms.findIndex(room => room.sessionId === sessionId);
        rooms[sessionIndex].config = config;
        io.to(sessionId).emit("set config", {
            ...rooms[sessionIndex]
        })
    });

    socket.on('get rooms', () => {
        io.emit('get rooms', rooms);
    })


    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});


server.listen(3000, () => {
    console.log('listening on *:3000');
});
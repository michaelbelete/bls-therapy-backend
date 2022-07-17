const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
const crypto = require("crypto");
const { config } = require('process');

const rooms = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client.html');
});

io.on('connection', (socket) => {
    //creating session event for the therapist 
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

    socket.on("terminate session", (sessionId) => {
        const sessionIndex = rooms.findIndex(room => room.sessionId === sessionId);
        rooms.splice(sessionIndex, 1);
        io.emit('terminate session', true);
    })

    socket.on("get session", (sessionId) => {
        const result = rooms.find(room => room.sessionId === sessionId);
        if(result) {
            io.emit("get session", {
                ...result,
            })
        }else{
            io.emit("get session", null)
        }
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

server.listen(8080, () => {
    console.log('listening on port 8080');
});
// module.exports = app;

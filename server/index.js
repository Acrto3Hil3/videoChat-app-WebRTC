/*const express = require("express");


const{createServer}=require('http')

const app=express()
const server = createServer(app)
const io=new Server(5000)
*/


const { Server } = require("socket.io")
const io = new Server(5000, {
    cors: true,
})
// const io=new Server(5000)

const emailToSocketMap = new Map()
const socketidTOEmailMap=new Map()

io.on("connection", (socket) => {
    console.log(`Socket Connected`, socket.id)
    socket.on('room:join', data => {
        const {email,room}=data
        emailToSocketMap.set(email, socket.id)
        socketidTOEmailMap.set(socket.id, email)
        io.to(room).emit("user:joined", {email,id:socket.id})
        socket.join(room)
        io.to(socket.id).emit('room:join', data)
    })
})

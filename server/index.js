/*const express = require("express");


const{createServer}=require('http')

const app=express()
const server = createServer(app)
const io=new Server(5000)
*/


const {Server} =require("socket.io")
const io=new Server(5000)

io.on("connection", (socket) => {
    console.log(`Socket Connected`,socket.id)
})

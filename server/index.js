
const { Server } = require("socket.io")
const io = new Server(5000, {
    cors: true,
})
// const io=new Server(5000)

const emailToSocketMap = new Map()
const socketIdTOEmailMap = new Map()

io.on("connection", (socket) => {
    console.log(`Socket Connected`, socket.id)
    socket.on('room:join', (data) => {
        const { email, room } = data
        emailToSocketMap.set(email, socket.id)
        socketIdTOEmailMap.set(socket.id, email)
        io.to(room).emit("user:joined", { email, id: socket.id })
        socket.join(room)
        io.to(socket.id).emit("room:join", data)
    })

    socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit("incoming:call", { from: socket.id, offer })
    })

    socket.on("call:accepted", ({ to, answer }) => {
        io.to(to).emit("call:accepted", { from: socket.id, answer })
    })

    socket.on("peer:nego:needed",({to,offer})=>{
        //console.log("peer:nego:needed",offer)
        io.to(to).emit("peer:nego:needed",{from:socket.id,offer})
    })

    socket.on("peer:nego:done",({to,answer})=>{
        //console.log("peer:nego:done",answer)
        io.to(to).emit("peer:nego:final",{from:socket.id,answer})
    })

    socket.on("end:call", ({ to }) => {
        io.to(to).emit("end:call");
    });
})

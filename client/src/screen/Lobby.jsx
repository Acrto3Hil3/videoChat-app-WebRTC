import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

export default function Lobby(){
  const[email, setEmail]=useState('')
  const[room, setRoom]=useState('')

  const socket =useSocket()
//  console.log(socket)

 const navigate=useNavigate()

  const handleSubmitForm = useCallback((e) => {
    e.preventDefault()
    socket.emit('room:join', { email, room })
  },
[email,room,socket])

const handleJoinRoom = useCallback((data) => {
  const {email, room} =data
  navigate(`/room/${room}`)
  console.log('joined room', email, room)
},[])
  
  useEffect(() => {
    socket.on('room:join',handleJoinRoom)
    return () =>{
      socket.off('room:join', handleJoinRoom)
    }
  },[socket,handleJoinRoom])

   return (
     <div>
       <h1>Lobby</h1>

       <form onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email Id</label>
        <input type="email" id="email" name="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <br />
        <label htmlFor="room">Room Number</label>
        <input type="text" id="room" name="room" value={room} onChange={(e)=>setRoom(e.target.value)}  required />
        <br />
        <button>Join</button>
       </form>
     </div>
   )
}
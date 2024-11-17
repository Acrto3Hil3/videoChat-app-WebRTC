import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'


export default function Room() {
    const socket=useSocket()

    const [remoteSocketId, setRemoteSocketId]=useState(null)
    const [myStream, setMyStream]=useState(null)

    const handleCallUser=useCallback(async ()=>{
        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true
        })
        setMyStream(stream)
    },[])

    const handleUsrJoined=useCallback(({email,id})=>{
        console.log(`Email ${email} joined the room`)
        setRemoteSocketId(id)
    },[])
    useEffect(()=>{
        socket.on("user:joined",handleUsrJoined)
        //socket clean up
        return () => { socket.off("user:joined", handleUsrJoined) }
    },[socket,handleUsrJoined])
  return (
    <div>
        <h1>Room</h1>
        <h4>{remoteSocketId? 'connected':'no one in the room'}</h4>
        {
            remoteSocketId &&  <button onClick={handleCallUser}>CALL</button>
        }
    </div>
  )
}

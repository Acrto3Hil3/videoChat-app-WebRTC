// latest one and final one


import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketProvider'
import peer from '../service/peer'

export default function Room() {
    const socket = useSocket()
    const navigate=useNavigate()

    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState()

    // tractkin is user on call or not
    const[isCallStarted,setIsCallStarted]=useState(false) 

    // track is coming user entered first or in last
    const [isFirstUser,setIsFirstUser]=useState(true)

    const [roomName] = useState("My Awesome Room");
    const [myName] = useState("Me");
    const [remoteName] = useState("Remote User");


    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })

        const offer = await peer.getOffer()
        console.log(`Calling ${remoteSocketId} with offer`, offer)
        socket.emit("user:call", { to: remoteSocketId, offer })
        setMyStream(stream)

        // marked here that call started
        setIsCallStarted(true)
    }, [remoteSocketId, socket])

    const handleUsrJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined the room`)
        setRemoteSocketId(id)

        // marked the second user presence
        setIsFirstUser(false)
    }, [])

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocketId(from) //-----extra---//
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
        setMyStream(stream)
        //Mark call started in incoming function
        setIsCallStarted(true)

        console.log(`Incoming call ${from}`, offer)
        const answer = await peer.getAnswer(offer)
        socket.emit("call:accepted", { to: from, answer })
    }, [socket])

    // const sendStreams = useCallback(() => {
    //     if (myStream && peer.peer) {
    //         myStream.getTracks().forEach((track) => {
    //             peer.peer.addTrack(track, myStream);
    //         });
    //     }
    // }, [myStream]);    

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream)
        }
    }, [myStream])

    const handleCallAccepted = useCallback(({ from, answer }) => {
        console.log(`Call accepted! from ${from}`, answer);
        peer.setLocalDescription(answer);
        sendStreams()
        setIsCallStarted(true) // --new added ----//
    }, [sendStreams]);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer()
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId })
    }, [remoteSocketId, socket])

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded)
        return (() => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded)
        })
    }, [handleNegoNeeded])

    const handleNegoNeedIncoming = useCallback(
        async ({ from, offer }) => {
            const answer = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", { to: from, answer });
        },
        [socket]
    );

    const handleNegoFinal = useCallback(async ({ answer }) => {
        await peer.setLocalDescription(answer)
    }, [])

    const handleEndCall=useCallback(()=>{
        socket.emit("end:call",{to:remoteSocketId})

        if(myStream){
            myStream.getTracks().forEach((track)=>
            track.stop())
            setMyStream(null)
        }
        setRemoteStream(null)
        setRemoteSocketId(null)
        setIsCallStarted(false)
        navigate('/')
    },[socket,remoteSocketId,myStream,navigate])
    useEffect(() => {
        socket.on("end:call",()=>{
            if(myStream){
                myStream.getTracks().forEach((track)=>track.stop())
            }
            setRemoteStream(null)
            setMyStream(null)
            setIsCallStarted(false)
            navigate('/')
        })
        peer.peer.addEventListener("track", async (evnt) => {
            const remoteStream = evnt.streams
            console.log('GOt Tracks')
            setRemoteStream(remoteStream[0])
        })
    }, [myStream,navigate,socket])
    useEffect(() => {
        socket.on("user:joined", handleUsrJoined)
        socket.on("incoming:call", handleIncomingCall)
        socket.on("call:accepted", handleCallAccepted)
        socket.on("peer:nego:needed", handleNegoNeedIncoming)
        socket.on("peer:nego:final", handleNegoFinal)

        //socket clean up
        return () => {
            socket.off("user:joined", handleUsrJoined)
            socket.off("incoming:call", handleIncomingCall)
            socket.off("call:accepted", handleCallAccepted)
            socket.off("peer:nego:needed", handleNegoNeedIncoming)
            socket.off("peer:nego:final", handleNegoFinal)
            socket.off("end:call")
        }
    }, [socket, handleUsrJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoFinal,navigate])

    return (
        <div className="flex flex-col items-center space-y-6 p-6">
        {/* Room Name */}
        <h1 className="text-3xl font-bold text-gray-700">{roomName}</h1>
          
            {/* Connection Status */}
            <h4 className="text-lg font-medium text-gray-500">
                {remoteSocketId ? 'Connected' : 'No one in the room'}
            </h4>

             {/* Waiting Text */}
             {!isCallStarted && isFirstUser && (
                <p className="text-lg text-gray-600 italic">Waiting for someone to join...</p>
            )}

             {/* Video Streams */}

          <div className="flex space-x-6">
            {/* My Video */}
            {myStream && (
                    <div className="relative border border-gray-300 p-4 rounded-lg shadow-md">
                        <h2 className="absolute top-2 left-2 bg-gray-900 text-white px-3 py-1 rounded text-sm font-bold">
                            {myName}
                        </h2>
                        <ReactPlayer playing muted width="350px" height="350px" url={myStream} />
                    </div>
                )}

                {/* Remote Video */}
                {remoteStream && (
                    <div className="relative border border-gray-300 p-4 rounded-lg shadow-md">
                        <h2 className="absolute top-2 left-2 bg-gray-900 text-white px-3 py-1 rounded text-sm font-bold">
                            {remoteName}
                        </h2>
                        <ReactPlayer playing width="350px" height="350px" url={remoteStream} />
                    </div>
                )}
          </div>

           {/* Buttons Section */}

            {myStream && (
              <button
                onClick={() => sendStreams()}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                Send Stream
              </button>
            )}
            {remoteSocketId && (
              <button
                onClick={() => handleCallUser()}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                Call
              </button>
            )} 
            {isCallStarted && (
                    <button
                        onClick={handleEndCall}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded mt-4">
                        End Call
                    </button>
            )}
        </div>
        
    );
}

import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { useSocket } from '../context/SocketProvider'
import peer from '../service/peer'

export default function Room() {
    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState()

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
        const offer = await peer.getOffer()
        console.log(`Calling ${remoteSocketId} with offer`, offer)
        socket.emit("user:call", { to: remoteSocketId, offer })
        setMyStream(stream)
    }, [remoteSocketId, socket])

    const handleUsrJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined the room`)
        setRemoteSocketId(id)
    }, [])

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocketId(from)
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
        setMyStream(stream)
        console.log(`Incoming call ${from}`, offer)
        const answer = await peer.getAnswer(offer)
        socket.emit("call:accepted", { to: from, answer })
    }, [socket])

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream)
        }
    }, [myStream])

    const handleCallAccepted = useCallback(({ from, answer }) => {
        console.log(`Call accepted! from ${from}`, answer);
        peer.setLocalDescription(answer);
        sendStreams()
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

    useEffect(() => {
        peer.peer.addEventListener("track", async (evnt) => {
            const remoteStream = evnt.streams
            console.log('GOt Tracks')
            setRemoteStream(remoteStream[0])
        })
    }, [])
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
        }
    }, [socket, handleUsrJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoFinal])

    return (
        <div>
            <h1>Room</h1>
            <h4>{remoteSocketId ? `Connected` : 'No one in the room'}</h4>
            {myStream && <button onClick={sendStreams}> Send Stream</button>}
            {
                remoteSocketId && <button onClick={handleCallUser}>CALL</button>
            }
            {
                myStream && (
                    <>
                        <h2>My Video</h2>
                        <ReactPlayer playing width="350px" height="350px" url={myStream} />
                    </>
                )
            }
            {
                remoteStream && (
                    <>
                        <h2>Remote Video</h2>
                        <ReactPlayer playing width="350px" height="350px" url={remoteStream} />
                    </>
                )
            }
        </div>
    )
}

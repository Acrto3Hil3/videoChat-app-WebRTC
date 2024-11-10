import React, { useContext, useMemo, createContext } from "react";
import { io } from 'socket.io-client';

const SocketContext=createContext(null)

export const useSocket = () => {
    const socket = useContext(SocketContext)
    return socket
}
export const SocketProvider = (props) => {
    const [socket, setSocket] = useMemo(() => {
        const newSocket = io('http://localhost:3000', [])
        return newSocket
    }, [])
    return (
        <SocketContext.Provider value={{ socket, setSocket }}>
            {props.children}
        </SocketContext.Provider>
    )
}
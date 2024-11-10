import React, { useCallback, useState } from "react";

export default function Lobby(){
  const[email, setEmail]=useState('')
  const[room, setRoom]=useState('')

  const handleSubmitForm = useCallback((e) => {
    e.preventDefault()
    console.log({
      email,
      room
    })
  }, [email,room])
  
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
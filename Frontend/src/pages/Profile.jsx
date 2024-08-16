import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useClient } from "../context/xmppContext"

export default function Profile(){
    const client = useClient()
    const navigate = useNavigate()
    const [status, setStatus] = useState(client.status)
    const [statusMessage, setStatusMessage] = useState(client.statusMessage)
    const handleChange = ()=>{
        client.updateStatus(status, statusMessage)
        navigate('/chat')
    }
    return (
        <>
        <button onClick={()=>{navigate('/chat')}}>Cancelar</button>
        <div>Profile</div>
        <form onSubmit={handleChange}>
            <label >Status:</label>
            <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            >
            <option value="online">Online</option>
            <option value="away">Away</option>
            <option value="dnd">Do Not Disturb</option>
            <option value="offline">Offline</option>
            </select>
            <label>Status Message:</label>
            <input
                type="text"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
            />
            <button>
                Cambiar
            </button>
        </form>
        </>
    )
}
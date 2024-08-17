import React, { useState } from "react"

export default function ContactBar({setContact, contacts}) {
    const [contactoEspecifico, setContactoEspecifico] = useState('')
    return (
        <div style={{
            width: '30%',
            backgroundColor: 'grey',
            height: 'calc(100% - 60px)',
            position: 'fixed',
            top: '60px',
            left: '0',
        }}>
            <label>Mensajear a alguien en especifico ingresa el jid</label>
            <input onChange={(e)=>setContactoEspecifico(e.target.value)}></input>
            <button onClick={()=>{
                setContact({jid:contactoEspecifico, status:"Desconocido no es de tu roaster", statusMessage:"Desconocido no es de tu roaster"})}
                }>ingresar</button>
            <ul>
            {Object.keys(contacts).length === 0 ? (
                <p>No contacts added</p>
            ) : (
            <>
                {Object.entries(contacts).map(([jid, contact]) => (
                <button onClick={()=>{
                    setContact(contact)}
                    }>
                    contact:{contact.jid}<br/>
                    status:{contact.status}<br/>
                    status message:{contact.statusMessage || "No status message"}<br/>
                </button>
                ))}
            </>
            )}
            </ul>
        </div>
    );
}

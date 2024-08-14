import React, { createContext, useRef } from "react"
import { xmppService } from "../services/services"

export const XMPPContext = createContext(null);

export const XMPPProvider = ({ children }) => {
  const clientRef = useRef(new xmppService("ws://alumchat.lol:7070/ws/"))

  return (
    <XMPPContext.Provider value={clientRef.current}>
      {children}
    </XMPPContext.Provider>
  )
}


export const useClient = () => {
  return useContext(XMPPContext)
}
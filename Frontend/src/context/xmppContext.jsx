// src/context/XMPPContext.js

import React, { createContext, useEffect, useState } from "react";
import { xmppService } from "../services/services";

export const XMPPContext = createContext();

export const XMPPProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    xmppService.xmpp.on("stanza", (stanza) => {
      if (stanza.is("message") && stanza.getChild("body")) {
        const from = stanza.attrs.from;
        const body = stanza.getChildText("body");
        setMessages((prev) => [...prev, { from, body }]);
      } else if (stanza.is("presence") && stanza.attrs.type === "subscribe") {
        const from = stanza.attrs.from;
        setFriendRequests((prev) => [...prev, from]);
      }
    });
  }, []);

  return (
    <XMPPContext.Provider value={{ messages, friendRequests }}>
      {children}
    </XMPPContext.Provider>
  );
};

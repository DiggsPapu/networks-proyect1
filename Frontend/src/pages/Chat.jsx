import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import ContactBar from '../components/ContactBar'
import Header from '../components/Header'
import ChatInstance from '../components/ChatInstance'
import { useClient } from '../context/xmppContext'

// Conditional styles for toggling the height and opacity of the chat body
const heightToggled = `
    height: 0%;
    min-height: 0%; 
    opacity: 0;
`;

const height = `
    height: 60%;
    opacity: 1;
`;

// Conditional styles for toggling the height of the chat container
const heightContainerToggled = `
    height: 100px;
`;

const heightContainer = `
    height: 500px;
`;

// Styled component for the main container, ensuring the chat aligns to the bottom-right of the screen
export const Container = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    width: 100%;
    height: 100%;
`;

// Styled component for the chat container, with conditional height adjustment
export const ChatContainer = styled.div`
    width: 500px;
    background-color: rgba(0,0,0,0.4) !important;
    border-radius: 4px 4px 0px 0px;
    flex-direction: column;
    margin-right: 10px;
    transition: all 0.5s ease;

    ${props => props.toggle ? heightContainerToggled : heightContainer}
`;

// Styled component for the chat body, with conditional height and opacity adjustments
export const ChatBody = styled.div`
    width: 100%;
    height: 60%;
    min-height: 60%;
    max-height: 60%;
    overflow: auto;
    transition: all 0.5s ease;

    ${props => props.toggle ? heightToggled : height}
`;

// Main Chat component
const Chat = () => {
  const client = useClient() // Access the XMPP client context
  const [contacts, setContacts] = useState({}) // State to manage the list of contacts
  const [currentChat, setCurrentChat] = useState(null) // State to manage the currently active chat
  
  // Effect to fetch the contact roster once the component mounts
  useEffect(() => {
    client.setrosterRecibido(setContacts) // Set the function to update contacts when the roster is received
    client.fetchRoster() // Fetch the roster from the XMPP server
  }, [client])
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column'}}>
      <Header 
        contacts={contacts} setContacts={(contacts)=>{setContacts(contacts)}}
      />
      <ContactBar setContact={(contact) => {
        setCurrentChat(contact) // Set the current chat when a contact is selected
      }} 
      contacts={contacts}/>
      {
        currentChat && <ChatInstance contact={currentChat} /> // Render the ChatInstance component if a contact is selected
      }
    </div>
  );
};

export default Chat;

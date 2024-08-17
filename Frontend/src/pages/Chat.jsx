import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import ContactBar from '../components/ContactBar'
import Header from '../components/Header'
import ChatInstance from '../components/ChatInstance'
import { useClient } from '../context/xmppContext'

const heightToggled = `
    height: 0%;
    min-height: 0%; 
    opacity: 0;
`;

const height = `
    height: 60%;
    opacity: 1;
`;

const heightContainerToggled = `
    height: 100px;
`;

const heightContainer = `
    height: 500px;
`;

export const Container = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    width: 100%;
    height: 100%;
`;

export const ChatContainer = styled.div`
    width: 500px;
    background-color: rgba(0,0,0,0.4) !important;
    border-radius: 4px 4px 0px 0px;
    flex-direction: column;
    margin-right: 10px;
    transition: all 0.5s ease;

    ${props => props.toggle ? heightContainerToggled : heightContainer}
`;

export const ChatBody = styled.div`
    width: 100%;
    height: 60%;
    min-height: 60%;
    max-height: 60%;
    overflow: auto;
    transition: all 0.5s ease;

    ${props => props.toggle ? heightToggled : height}
`;


const Chat = () => {
  const client = useClient()
  const [contacts, setContacts] = useState({})
  const [currentChat, setCurrentChat] = useState(null)
  useEffect(() => {
    client.setrosterRecibido(setContacts)
    client.fetchRoster()
  }, [client])
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column'}}>
      <Header 
      contacts={contacts} setContacts={(contacts)=>{setContacts(contacts)}}
      />
      <ContactBar setContact={(contact) => {
        setCurrentChat(contact)
      }} 
      contacts={contacts}/>
      {
        currentChat && <ChatInstance contact={currentChat} />
      }
    </div>
  );
};

export default Chat;
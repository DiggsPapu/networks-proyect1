import React, { useEffect, useState } from 'react'
import ChatHead from '../components/ChatHead'
import Message from '../components/Message'
import ChatFooter from '../components/ChatFooter'
import styled from 'styled-components'
import { useClient } from '../context/xmppContext'


const heightToggled = `
    height: 0%;
    min-height: 0%; 
    opacity: 0;
`

const height = `
    height: 60%;
    opacity: 1;
`

const heightContainerToggled = `
    height: 100px;
`

const heightContainer = `
    height: 500px;
`
export const ChatContainer = styled.div`
    width: 500px;
    background-color: rgba(0,0,0,0.4) !important;
    border-radius: 4px 4px 0px 0px;
    flex-direction: column;
    position: fixed;
    bottom: 0;
    right: 0;
    transition: all 0.5s ease;
    margin-right:2px;

    ${props => props.toggle ? heightContainerToggled : heightContainer}
`

export const ChatBody = styled.div`
    width: 100%;
    height: 60%;
    min-height: 60%;
    max-height: 60%;
    overflow: auto;
    transition: all 0.5s ease;

    ${props => props.toggle ? heightToggled : height}
`
export default function ChatInstance({ contact, type="user" }) {
    const [messages, setMessages] = useState([]);
    const [toggleChat, setToggleChat] = useState(false);
    const [messagesId, setMessagesId] = useState([]);
    const [messageChanges, setMessageChanges] = useState(localStorage.getItem("messages"));
    const client = useClient()
    useEffect(()=>{
        console.log(contact)
    },[])
    const onSubmitMessage = async (msg) => {
        client.sendMessage(contact.jid, msg)
        setMessages([...messages, {userId:1, message: msg}])
    };

    const handleToggle = () => {
        setToggleChat(!toggleChat);
    };

    return (
        <ChatContainer toggle={toggleChat}>
            <ChatHead 
                name={contact.jid} 
                toggle={toggleChat}
                onClick={handleToggle}
                presence={contact.status}
                presenceMessage={contact.statusMessage}
            />
            <ChatBody toggle={toggleChat}>
                <Message messages={messages} />
            </ChatBody>
            <ChatFooter 
                toggle={toggleChat}
                onSubmitMessage={onSubmitMessage}
            />
        </ChatContainer>
    );
}
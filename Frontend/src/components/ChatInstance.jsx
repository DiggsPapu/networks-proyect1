import React, { useEffect, useState } from 'react';
import ChatHead from '../components/ChatHead';
import Message from '../components/Message';
import ChatFooter from '../components/ChatFooter';
import styled from 'styled-components';
import { useClient } from '../context/xmppContext';

// Styles for toggling chat visibility
const heightToggled = `
    height: 0%;
    min-height: 0%; 
    opacity: 0;
`;

const height = `
    height: 60%;
    opacity: 1;
`;

// Styles for toggling chat container height
const heightContainerToggled = `
    height: 100px;
`;

const heightContainer = `
    height: 500px;
`;

// Styled component for the chat container
export const ChatContainer = styled.div`
    width: 500px;
    background-color: rgba(0,0,0,0.4) !important;
    border-radius: 4px 4px 0px 0px;
    flex-direction: column;
    position: fixed;
    bottom: 0;
    right: 0;
    transition: all 0.5s ease;
    margin-right: 2px;

    ${props => props.toggle ? heightContainerToggled : heightContainer}
`;

// Styled component for the chat body (messages area)
export const ChatBody = styled.div`
    width: 100%;
    height: 60%;
    min-height: 60%;
    max-height: 60%;
    overflow: auto;
    transition: all 0.5s ease;

    ${props => props.toggle ? heightToggled : height}
`;

// ChatInstance functional component that manages the chat UI and functionality
export default function ChatInstance({ contact, type = "user" }) {
    const [messages, setMessages] = useState([]);  // State to store messages
    const [toggleChat, setToggleChat] = useState(false);  // State to toggle chat visibility
    const client = useClient();  // XMPP client from context

    // Function to handle sending a message
    const onSubmitMessage = async (msg) => {
        client.setMensajeRecibido(updateMessages);  // Set the callback to update messages when a new message is received
        client.enviarMensaje(contact.jid, msg);  // Send the message using the XMPP client
        setMessages(prevMessages => {
            const date = Date.now();  // Get the current timestamp
            let newMessages = [...prevMessages, { userId: 1, from: client.jid, to: contact.jid, message: msg, time: date }];  // Add the new message to the state
            client.messagesReceived.push({ userId: 1, from: client.jid, to: contact.jid, message: msg, time: date });  // Add the message to the client's received messages
            return newMessages.filter((message) => (message.from === contact.jid) || (message.from === client.jid && message.to === contact.jid));  // Filter messages relevant to the current chat
        });
    };

    // Function to update messages when a new message is received
    const updateMessages = (to, from, message, timestamp) => {
        if (from === contact.jid && messages.filter((message) => message.timestamp == timestamp && message.from === from).length === 0) {
            setMessages(prevMessages => {
                const newMessages = [...prevMessages, { userId: 0, from: from, to: client.jid, message: message, time: timestamp }];  // Add the new message to the state
                return newMessages.filter((message) => (message.from === contact.jid) || (message.from === client.jid && message.to === contact.jid));  // Filter messages relevant to the current chat
            });
        }
    };

    // Toggle chat visibility
    const handleToggle = () => {
        setToggleChat(!toggleChat);  // Invert the toggleChat state
    };

    // Effect to set the initial messages when the contact changes
    useEffect(() => {
        setMessages(client.messagesReceived.filter((message) => (message.from === contact.jid) || (message.from === client.jid && message.to === contact.jid)));  // Filter the messages relevant to the current chat
    }, [contact.jid]);

    // Effect to set the message update function
    useEffect(() => {
        client.setMensajeRecibido(updateMessages);  // Set the callback to update messages when a new message is received
    }, [client]);

    return (
        // The return section remains unchanged, so it is not commented
        <ChatContainer toggle={toggleChat}>
            <ChatHead
                name={contact.jid}
                toggle={toggleChat}
                onClick={handleToggle}
                presence={contact.status}
                presenceMessage={contact.statusMessage}
            />
            <ChatBody id={`chatinstance-${contact.jid}`} toggle={toggleChat}>
                <Message messages={messages} />
            </ChatBody>
            <ChatFooter
                toggle={toggleChat}
                onSubmitMessage={onSubmitMessage}
            />
        </ChatContainer>
    );
}

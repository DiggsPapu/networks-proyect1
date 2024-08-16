import React, { useEffect, useState } from 'react';
import ChatHead from '../components/ChatHead';
import Message from '../components/Message';
import ChatFooter from '../components/ChatFooter';
import styled from 'styled-components';
import { useClient } from '../context/xmppContext';

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

export const ChatBody = styled.div`
    width: 100%;
    height: 60%;
    min-height: 60%;
    max-height: 60%;
    overflow: auto;
    transition: all 0.5s ease;

    ${props => props.toggle ? heightToggled : height}
`;

export default function ChatInstance({ contact, type = "user" }) {
    const [messages, setMessages] = useState([]);
    const [toggleChat, setToggleChat] = useState(false);
    const client = useClient();

    const onSubmitMessage = async (msg) => {
        updateMessages()
        client.setOnMessageReceived(updateMessages)
        client.sendMessage(contact.jid, msg)
        setMessages(prevMessages => [...prevMessages, { userId: 1, message: msg }])
    }

    const updateMessages = () => {
        const newMessages = client.messagesReceived
            .filter(message => message.from === contact.jid && !message.alreadyDisplayed)
            .map(message => {
                message.alreadyDisplayed = true;
                return { userId: 0, message: message.body }
            })
        if (newMessages.length > 0) {
            setMessages(prevMessages => [...prevMessages, ...newMessages])
        }
    }

    const handleToggle = () => {
        setToggleChat(!toggleChat)
    }
    useEffect(()=>{
        client.contactCurrentlyChatting = contact.jid
        setMessages([])
    }, [contact])
    useEffect(() => {
        updateMessages()
        client.setOnMessageReceived(updateMessages)

        return () => {
            client.setOnMessageReceived(() => {});
        };
    }, [client]);

    return (
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

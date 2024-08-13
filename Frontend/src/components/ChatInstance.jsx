import React, { useEffect, useState } from 'react';
import ChatHead from '../components/ChatHead';
import Message from '../components/Message';
import ChatFooter from '../components/ChatFooter';
import styled from 'styled-components';
import { sendMessage } from "../services/services"

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
    margin-right:2px;

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

function getQuote(numberMessages) {
    const nouns = ["car", "horse", "apple", "person", "chimp"];
    const adjectives = ["red", "fast", "lonely", "hungry", "insane"];
  
    const messages = [];
  
    for (let i = 0; i <= numberMessages; i++) {
        const randomNounIndex = Math.floor(Math.random() * nouns.length);
        const randomAdjectiveIndex = Math.floor(Math.random() * adjectives.length);
        const retVal = `The ${nouns[randomNounIndex]} is ${adjectives[randomAdjectiveIndex]}`;
        messages.push({ userId: i % 2 === 0 ? 1 : 2, message: retVal });
    }
  
    return messages;
  }
export default function ChatInstance({ contact, type="user" }) {
    const [messages, setMessages] = useState([]);
    const [toggleChat, setToggleChat] = useState(false);
    const [messagesId, setMessagesId] = useState([]);
    const [messageChanges, setMessageChanges] = useState(localStorage.getItem("messages"));
    useEffect(()=>{
        let mes = JSON.parse(localStorage.getItem("messages"));
            console.log(mes)
            mes.map((message)=>{
                if(message.from.split("@")[0]===contact.name && !messagesId.includes(message.id)){
                    setMessagesId([...messagesId, message.id]);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { userId: 2, message: message.body }
                    ]);
                }
            })
    },[localStorage.getItem("messages")])
    const onSubmitMessage = async (msg) => {
        console.log(contact)
        if(await sendMessage(contact.name, msg, type).then(setTimeout(5000))){
            setMessages((prevMessages) => [
                ...prevMessages,
                { userId: 1, message: msg }
            ]);
            let mes = JSON.parse(localStorage.getItem("messages"));
            console.log(mes)
            mes.map((message)=>{
                if(message.from.split("@")[0]===contact.name && !messagesId.includes(message.id)){
                    setMessagesId([...messagesId, message.id]);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { userId: 2, message: message.body }
                    ]);
                }
            })
        };
    };

    const handleToggle = () => {
        setToggleChat(!toggleChat);
    };

    return (
        <ChatContainer toggle={toggleChat}>
            <ChatHead 
                name={contact.name} 
                toggle={toggleChat}
                onClick={handleToggle}
                presence={contact.presence}
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
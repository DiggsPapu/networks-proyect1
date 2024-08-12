import React, { useRef, useState } from 'react';import { useNavigate } from 'react-router-dom';
import { add_contact, delete_account, logOut } from '../services/auth-service';
import styled from 'styled-components';
import ContactBar from '../components/ContactBar';
import Header from '../components/Header';
import ChatInstance from '../components/ChatInstance';

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
  const navigate = useNavigate();
  const [name] = useState(localStorage.getItem("username"));
  const [toggleChat, setToggleChat] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);

  const addContact = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const username = data.get('contactUsername');
    const success = await add_contact(username);
    if (success) {
      setIsFormVisible(false);
    }
  };

  const onSubmitMessage = (msg) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { userId: 1, message: msg }
    ]);
  };

  const handleToggle = () => {
    setToggleChat(!toggleChat);
  };

  const logout = async () => {
    const success = await logOut();
    if (success) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const deleteAccount = async () => {
    const success = await delete_account();
    if (success) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column'}}>
      <Header/>
      <ContactBar setContact={(contact) => {
        setCurrentChat(contact)
        console.log(contact)
      }
        } />
      {
        currentChat && <ChatInstance contact={currentChat} />
      }
    </div>
  );
};

export default Chat;
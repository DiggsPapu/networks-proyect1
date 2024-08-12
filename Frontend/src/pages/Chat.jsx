import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatHead from '../components/ChatHead';
import Message from '../components/Message';
import ChatFooter from '../components/ChatFooter';
import { add_contact, delete_account, logOut } from '../services/auth-service';
import GlobalStyle from '../GlobalStyle';
import styled from 'styled-components';
import FriendRequestDropDown from '../components/FriendRequestDropDown';

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

    ${props => props.toggle === true ? heightContainerToggled : heightContainer}
    transition: all 0.5s ease;
`;

export const ChatBody = styled.div`
    width: 100%;
    height: 60%;
    min-height: 60%;
    max-height: 60%;
    overflow: auto;

    ${props => props.toggle === true ? heightToggled : height}
`;

function getQuote(numberMessages) {
  const nouns = ["car", "horse", "apple", "person", "chimp"];
  const adjectives = ["red", "fast", "lonely", "hungry", "insane"];

  const messages = [];

  for (let i = 0; i <= numberMessages; i++) {
      const randomNounIndex = Math.floor(Math.random() * nouns.length);
      const randomAdjectiveIndex = Math.floor(Math.random() * adjectives.length);
      const retVal = i % 2 === 0 ?
                    `The ${nouns[randomNounIndex]} is ${adjectives[randomAdjectiveIndex]} and 
                    ${nouns[randomNounIndex]} is ${adjectives[randomAdjectiveIndex]} and
                    ${nouns[randomNounIndex]} is ${adjectives[randomAdjectiveIndex]}`
                  : 
                    `${nouns[randomNounIndex]} is ${adjectives[randomAdjectiveIndex]}`;
      messages.push({userId: i % 2 === 0 ? 1 : 2, message: retVal});
  }

  return messages;
}

const Chat = () => {
  const navigate = useNavigate();
  const [name] = useState(localStorage.getItem("username"));
  const [messages, setMessages] = useState(getQuote(10));
  const [toggleChat, setToggleChat] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const addContact = async (event) => {
    event.preventDefault();
    const form = event.currentTarget; // Get the form element
    const data = new FormData(form); // Pass the form element to FormData
    let username = data.get('contactUsername');
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
    <>
      <GlobalStyle />
      <button type='button' onClick={logout}>Log out</button>
      <button type='button' onClick={deleteAccount}>Delete Account</button>
      <>
        <button onClick={toggleFormVisibility}>
          AddContact
        </button>
        {isFormVisible && (
          <form onSubmit={addContact}>
            <div>
              <label htmlFor="contactUsername">Add contact's user name:</label>
              <input type="text" id="contactUsername" name="contactUsername" />
            </div>
            <button type="submit">Submit</button>
          </form>
        )}
      </>
      <>
      <FriendRequestDropDown />
        <ChatContainer toggle={toggleChat}>
          <ChatHead 
            name={name} 
            toggle={toggleChat}
            onClick={handleToggle}
          />
          <ChatBody toggle={toggleChat}>
            <Message messages={messages} />
          </ChatBody>
          <ChatFooter 
            toggle={toggleChat}
            onSubmitMessage={onSubmitMessage}
          />
        </ChatContainer>
      </>        
    </>
  );
};

export default Chat;

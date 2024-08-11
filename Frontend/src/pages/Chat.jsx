import React, { Component, Fragment } from 'react'
import { useNavigate } from "react-router-dom"
import ChatHead from '../components/ChatHead'
import Message from '../components/Message'
import ChatFooter from '../components/ChatFooter'
import { deleteAccount, logout } from '../services/auth-service'
import GlobalStyle from '../GlobalStyle'
import styled from 'styled-components'


const withNavigate = (Component) => {
  return (props) => {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />
  }
}

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
    flex-direction: colunm;
    margin-right: 10px;

    ${props => props.toggle === true ? heightContainerToggled : heightContainer}
	transition: all 0.5s ease;
`

export const ChatBody = styled.div`
    width: 100%;
    height: 60%;
    min-height: 60%;
    max-height: 60%;
    overflow: auto;

    ${props => props.toggle === true ? heightToggled : height}
`;

const body = ({toggle, children}) => (
    <ChatBody
        toggle={toggle}
    >
        {children}
    </ChatBody>
)

const container = ({toggle, children}) => (
    <ChatContainer
        toggle={toggle}
    >
        {children}
    </ChatContainer>
)

function getQuote(numberMessages) {
  var nouns = ["car", "horse", "apple", "person", "chimp"];
  var adjectives = ["red", "fast", "lonely", "hungry", "insane"];

  var messages = [];

  for (var i = 0; i <= numberMessages; i++) {
      var randomNounIndex = Math.floor(Math.random() * nouns.length);
      var randomAdjectiveIndex = Math.floor(Math.random() * adjectives.length);
      var retVal = i % 2 === 0 ?
                    `The ${nouns[randomNounIndex]} is ${adjectives[randomAdjectiveIndex]} and 
                    ${nouns[randomNounIndex]} is ${adjectives[randomAdjectiveIndex]} and
                    ${nouns[randomNounIndex]} is ${adjectives[randomAdjectiveIndex]}`
                  : 
                    `${nouns[randomNounIndex]} is ${adjectives[randomAdjectiveIndex]}`;
      messages.push({userId: i % 2 === 0 ? 1 : 2, message: retVal})
  }

  return messages;
}

class Chat extends Component {
  state = {
    name: localStorage.getItem("username"),
    messages: getQuote(),
    toggleChat: false,
  }
  onSubmitMessage = msg => {
    this.setState((prevState) => {
      const newMessage = {userId: 1, message:msg }
      return {   
        messages: [...prevState.messages, newMessage]
      }
    })
  }

  handleToggle = () => {
    this.setState({toggleChat: !this.state.toggleChat})
  }
  logout = async () => {
    const success = await logout()
    if (success) {
      localStorage.clear()
      this.props.navigate('/login')
    }
  }
  deleteAccount = async () => {
    const success = await deleteAccount()
    if (success) {
      localStorage.clear()
      this.props.navigate('/login')
    }
  }
  render() {
    return (
      <Fragment>
        <GlobalStyle />
        <button type='submit' onClick={this.logout}>Log out</button>
        <button type='submit' onClick={this.deleteAccount}>Delete Account</button>
        <Container>
          <ChatContainer
            toggle={this.state.toggleChat}
          >
            <ChatHead 
              name={this.state.name} 
              toggle={this.state.toggleChat}
              onClick={this.handleToggle}
            />
            <ChatBody toggle={this.state.toggleChat}>
              <Message messages={this.state.messages} />
            </ChatBody>
            <ChatFooter 
              toggle={this.state.toggleChat}
              onSubmitMessage={this.onSubmitMessage}/>
          </ChatContainer>
        </Container>        
      </Fragment>
    );
  }
}

export default withNavigate(Chat)

import React, { Fragment } from 'react'
import styled from 'styled-components'

// Conditional styles for the message wrapper based on whether the message was sent or received
const wrapperSentProps = `
    justify-content: flex-end;
    text-align: right;
`

const wrapperReceivedProps = `
    justify-content: flex-start;
    text-align: left;
`

// Styled component for the message wrapper, applying conditional styles
export const StyledMessageWrapper = styled.div`   
    display: flex;

    ${props => props.type === 'sent' && wrapperSentProps} // Apply styles for sent messages
    ${props => props.type === 'received' && wrapperReceivedProps} // Apply styles for received messages
`;

// Wrapper component that applies the appropriate styling based on the message type
const Wrapper = ({ type, children }) => (
    <StyledMessageWrapper
        type={type}
    >
        {children}
    </StyledMessageWrapper>
)

// Conditional styles for the message content based on whether the message was sent or received
const messageSentProps = `
    background-color: lightblue;
    margin: 0px 25px 5px 5px;
`

const messageReceivedProps = `
    background-color: lightgreen;
    margin: 0px 5px 5px 5px;
`

// Styled component for the message content, applying conditional styles
export const StyledMessage = styled.div`
    position: relative;    
    padding: 10px 5px;
    border-radius: 10px;
    color: black;

    ${props => props.type === 'sent' && messageSentProps} // Apply styles for sent messages
    ${props => props.type === 'received' && messageReceivedProps} // Apply styles for received messages
`

// Message component that renders the message content with appropriate styling
const Message = ({ type, children}) => (
    <StyledMessage
        type={type}
    >
        {children}
    </StyledMessage>
)

// Function to render the list of messages, determining the styling based on the userId
function renderMessages(messages) {
    return messages.map((m, i) => (
        <StyledMessageWrapper key={i} type={m.userId === 1 ? 'sent' : 'received'}>
            <StyledMessage type={m.userId === 1 ? 'sent' : 'received'}>
                {m.message}
            </StyledMessage>
        </StyledMessageWrapper>
    ))
}

// Default export that renders the messages using the renderMessages function
export default props => (
    <Fragment>
        {renderMessages(props.messages)}
    </Fragment>
)

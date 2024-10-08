import React from 'react';
import { FaBars } from 'react-icons/fa';
import styled from 'styled-components';

// Define a styled component for the header section of the chat
export const Head = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    transition: all 0.5s ease;
    padding: 8px;
    justify-content: space-between;
    border-radius: 4px 4px 0px 0px;
    background-color: rgba(0,0,0,.03);
    ${props => props.toggle ? 'height: 100%;' : 'height: 20%;'} 
    div:first-child {
        display: flex;
        align-items: center;
    }
    div:nth-child(2) {
        margin-right: 5px;
        svg:hover {
            cursor: pointer;
        }
    }

    span {
        font-size: 28px;
        font-weight: bold;
    }
    .coso {
        display: flex;
        flex-direction: column;
    }
    .coso span {
        font-size: 10px;
        color: lightgreen;
    }
`;

// Functional component to render the chat header
const ChatHead = ({ name, toggle, onClick, presence, presenceMessage }) => (
    <Head toggle={toggle}>
        <div>
            <span>{name}</span>
            <div className="coso">
                <span>{presence}</span>
                <span>{presenceMessage}</span>
            </div>
        </div>
        <div>
            <FaBars onClick={onClick} />
        </div>
    </Head>
);

export default ChatHead;

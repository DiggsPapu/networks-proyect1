import React, { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { acceptFriendRequest, getContacts } from "../services/services"
import { useClient } from '../context/xmppContext'
import styled from 'styled-components'

// Styled components for dropdown
const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
`;

// DropdownContent handles the visibility and layout of the dropdown menu
const DropdownContent = styled.ul`
    display: ${props => props.open ? 'block' : 'none'}; // Controls whether the dropdown is visible
    position: absolute;
    border-radius: 4px;
    width: 100%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1;
    padding: 0;
    margin: 0;
    list-style: none;
    box-sizing: border-box;
`;

// DropdownItem defines the style for each item in the dropdown list
const DropdownItem = styled.li`
    padding: 10px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: #f1f1f1;
    }

    button {
        margin-left: 10px;
        border: none;
        color: white;
        cursor: pointer;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 14px;
    }

    button.reject {
        background-color: red;
    }

    button.accept {
        background-color: green;
    }
`;

// FriendRequestDropDown functional component for handling friend requests
export default function FriendRequestDropDown({ setContacts, contacts }) {
    const client = useClient() // Get the XMPP client from the context
    const [friendList, setFriendList] = useState(client.subscriptionQueue) // Initialize the friend request list from the client's subscription queue
    const [open, setOpen] = useState(false) // State to handle dropdown visibility

    // Function to handle accepting a friend request
    const friendRequestAccepted = async (friendRequest) => {
        client.aceptarSubscripcion(friendRequest) // Call the client's method to accept the subscription
        setFriendList(friendList.filter((name) => name !== friendRequest)) // Remove the accepted friend request from the list
        client.fetchRoster() // Refresh the roster
    }

    // Function to handle rejecting a friend request
    const friendRequestRejected = async (friendRequest) => {
        client.rechazarSubscripcion(friendRequest) // Call the client's method to reject the subscription
        setFriendList(friendList.filter((name) => name !== friendRequest)) // Remove the rejected friend request from the list
        client.fetchRoster() // Refresh the roster
    }

    return (
        // The return section remains unchanged, so it is not commented
        <DropdownContainer>
            <button onClick={() => setOpen(!open)}>
                Friend Requests
            </button>
            <DropdownContent open={open}>
                {friendList.length > 0 ? (
                    friendList.map((friendRequest, index) => (
                        <DropdownItem key={index} id={friendRequest}>
                            {friendRequest}
                            <div>
                                <button className="reject" type="button" onClick={() => friendRequestRejected(friendRequest)}>
                                    <FontAwesomeIcon icon="fa-solid fa-x" />
                                </button>
                                <button className="accept" type="button" onClick={() => friendRequestAccepted(friendRequest)}>
                                    <FontAwesomeIcon icon="fa-solid fa-check" />
                                </button>
                            </div>
                        </DropdownItem>
                    ))
                ) : (
                    <DropdownItem>No friend requests</DropdownItem>
                )}
            </DropdownContent>
        </DropdownContainer>
    );
}

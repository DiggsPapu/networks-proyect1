import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { accept_friend_request, get_contacts } from "../services/auth-service";
import styled from 'styled-components';

// Styled components for dropdown
const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
`;

const DropdownButton = styled.button`
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: #0056b3;
    }
`;

const DropdownContent = styled.ul`
    display: ${props => props.open ? 'block' : 'none'};
    position: absolute;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1;
    padding: 0;
    margin: 0;
    list-style: none;
    box-sizing: border-box;
`;

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

export default function FriendRequestDropDown() {
    const [friendList, setFriendList] = useState(JSON.parse(localStorage.getItem("requests") || "[]"))
    // Filter friend list
    useEffect(() => {
        const contacts = JSON.parse(localStorage.getItem("contacts") || "[]")
        
        const filteredFriends = []
        contacts.map((contact)=>{
            if (!friendList.includes(contact.jid)){
                filteredFriends.push(contact.jid)
            }
        })
        setFriendList(filteredFriends)
    },[]);

    const [open, setOpen] = useState(false)

    const friendRequestAccepted = async (friendRequest) => {
        await accept_friend_request(friendRequest);
        setFriendList(friendList.filter((name) => name !== friendRequest));
        await get_contacts();
    };

    const friendRequestRejected = async (friendRequest) => {
        // Handle the rejection logic here (if any)
        setFriendList(friendList.filter((name) => name !== friendRequest));
        await get_contacts();
    };

    return (
        <DropdownContainer>
            <DropdownButton onClick={() => setOpen(!open)}>
                Friend Requests
            </DropdownButton>
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

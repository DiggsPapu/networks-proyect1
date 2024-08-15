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


const DropdownContent = styled.ul`
    display: ${props => props.open ? 'block' : 'none'};
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

export default function FriendRequestDropDown({contacts, setContacts}) {
    const [open, setOpen] = useState(false)
    const client = useClient()
    const [requests, setRequests] = useState([])

    useEffect(() => {
        client.fetchSubscriptionRequests(setRequests)
        client.setOnSubscriptionReceived(setRequests)
    }, [client])

    const friendRequestAccepted = async (friendRequest) => {
        client.acceptSubscription(friendRequest)
        setRequests(requests.filter((contact)=>contact!==friendRequest))
        setContacts(() => ({
            ...contacts,
            [friendRequest]: {
                jid: friendRequest,
                status: "online", // or any default status you want to set
                statusMessage: "Available" // or any default status message
            }
        }))
    }

    const friendRequestRejected = async (friendRequest) => {
        client.rejectSubscription(friendRequest)
        setRequests(requests.filter((contact)=>contact!==friendRequest))
    }

    return (
        <DropdownContainer>
            <button onClick={() => setOpen(!open)}>
                Friend Requests
            </button>
            <DropdownContent open={open}>
                {requests.length > 0 ? (
                    requests.map((friendRequest, index) => (
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

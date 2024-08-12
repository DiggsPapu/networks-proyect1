import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { accept_friend_request } from "../services/auth-service";

export default function FriendRequestDropDown() {
    const [currentFriendRequest, setCurrentFriendRequest] = useState('');
    const [friendList, setFriendList] = useState(JSON.parse(localStorage.getItem("requests") || "[]"));
    const [open, setOpen] = useState(false);

    const friendRequestAccepted = async (friendRequest) => {
        await accept_friend_request(friendRequest);
        setFriendList(friendList.filter((name) => name !== friendRequest));
    };

    const friendRequestRejected = (friendRequest) => {
        // Handle the rejection logic here (if any)
        setFriendList(friendList.filter((name) => name !== friendRequest));
    };

    return (
        <div>
            <button onClick={() => setOpen(!open)}>
                Friend Requests
            </button>
            {open && (
                <ul>
                    {friendList.length > 0 ? (
                        friendList.map((friendRequest, index) => (
                            <li key={index} id={friendRequest}>
                                {friendRequest}
                                
                                <button style={{backgroundColor: "red"}} type="button" onClick={() => friendRequestRejected(friendRequest)}>
                                    <FontAwesomeIcon icon="fa-solid fa-x" />
                                </button>
                                <button style={{backgroundColor: "green"}} type="button" onClick={() => friendRequestAccepted(friendRequest)}>
                                    <FontAwesomeIcon icon="fa-solid fa-check" />
                                </button>
                            </li>
                        ))
                    ) : (
                        <li>No friend requests</li>
                    )}
                </ul>
            )}
        </div>
    );
}

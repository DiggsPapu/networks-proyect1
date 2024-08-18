import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClient } from "../context/xmppContext";

export default function Profile() {
  const client = useClient(); // Access the XMPP client context
  const navigate = useNavigate(); // Hook for navigating between routes
  const [status, setStatus] = useState(client.status); // State for the user's status
  const [statusMessage, setStatusMessage] = useState(client.statusMessage); // State for the user's status message

  // Function to handle status change
  const handleChange = () => {
    client.actualizarEstado(status, statusMessage); // Update the status and status message in the XMPP client
    navigate('/chat'); // Navigate back to the chat page after updating
  };

  return (
    <>
      {/* Button to navigate back to the chat page without making changes */}
      <button onClick={() => navigate('/chat')}>Cancelar</button>
      <div>Profile</div>

      {/* Form to change status and status message */}
      <form onSubmit={handleChange}>
        <label>Status:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="online">Online</option>
          <option value="away">Away</option>
          <option value="dnd">Do Not Disturb</option>
          <option value="offline">Offline</option>
        </select>
        
        <label>Status Message:</label>
        <input
          type="text"
          value={statusMessage}
          onChange={(e) => setStatusMessage(e.target.value)}
        />
        
        <button>
          Change
        </button>
      </form>
    </>
  );
}

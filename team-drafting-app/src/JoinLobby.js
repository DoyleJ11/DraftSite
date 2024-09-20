// src/JoinLobby.js

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "./SocketContext";

function JoinLobby() {
  const socket = useContext(SocketContext);
  const [inputCode, setInputCode] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    if (socket) {
      socket.emit("joinLobby", { lobbyCode: inputCode });
    } else {
      console.error("Socket is not initialized");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleLobbyJoined = (lobbyCodeFromServer) => {
      navigate("/lobby", {
        state: { lobbyCode: lobbyCodeFromServer, isHost: false },
      });
    };

    const handleError = (message) => {
      setErrorMessage(message);
    };

    socket.on("lobbyJoined", handleLobbyJoined);
    socket.on("error", handleError);

    return () => {
      socket.off("lobbyJoined", handleLobbyJoined);
      socket.off("error", handleError);
    };
  }, [socket, navigate]);

  return (
    <div>
      {errorMessage && <p>{errorMessage}</p>}
      <form onSubmit={submit}>
        <input
          name="codeInput"
          id="codeInput"
          placeholder="Lobby Code"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default JoinLobby;
//end

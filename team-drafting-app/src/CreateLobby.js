// src/CreateLobby.js

import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "./SocketContext";

function CreateLobby() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleLobbyCreated = (code) => {
      navigate("/lobby", { state: { lobbyCode: code, isHost: true } });
    };

    socket.on("lobbyCreated", handleLobbyCreated);

    return () => {
      socket.off("lobbyCreated", handleLobbyCreated);
    };
  }, [socket, navigate]);

  const createLobby = () => {
    if (socket) {
      socket.emit("createLobby");
    } else {
      console.error("Socket is not initialized");
    }
  };

  return (
    <div>
      <h1>Create Lobby</h1>
      <button onClick={createLobby}>Create Lobby</button>
    </div>
  );
}

export default CreateLobby;
//end

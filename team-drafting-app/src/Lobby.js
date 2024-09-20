// src/Lobby.js

import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "./SocketContext";

function Lobby() {
  const socket = useContext(SocketContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract lobbyCode and isHost from location.state
  const lobbyCode = location.state?.lobbyCode || "";
  const isHost = location.state?.isHost || false;

  const [draftState, setDraftState] = useState(null);
  const [playerList, setPlayerList] = useState([]);

  useEffect(() => {
    if (!socket) return;

    if (!lobbyCode) {
      // Handle missing lobbyCode
      return;
    }

    // Re-join the lobby room
    console.log("Re-joining lobby room:", lobbyCode);
    socket.emit("joinLobbyRoom", { lobbyCode });

    // Listen for draft updates
    socket.on("updateDraft", (state) => {
      setDraftState(state);
    });

    // Listen for playersUpdated event
    const handlePlayersUpdated = (players) => {
      console.log("Received playersUpdated event with players:", players);
      setPlayerList(players);
    };

    socket.on("playersUpdated", handlePlayersUpdated);

    const handleGameStart = (lobbyCode) => {
      console.log("Received gameStarted event with lobbyCode:", lobbyCode);
      navigate("/draft", {
        state: { lobbyCode: lobbyCode },
      });
    };

    socket.on("gameStarted", handleGameStart);

    // Clean up event listeners on unmount
    return () => {
      console.log(
        "Unmounting Lobby component, emitting leaveLobby for lobbyCode:",
        lobbyCode
      );
      if (socket && lobbyCode) {
        socket.emit("leaveLobby", { lobbyCode });
      }
      socket.off("updateDraft");
      socket.off("playersUpdated", handlePlayersUpdated);
      socket.off("gameStarted", handleGameStart);
    };
  }, [socket, lobbyCode, navigate]);

  const pickChampion = (champion) => {
    if (socket) {
      socket.emit("pickChampion", { lobbyCode, champion });
    } else {
      console.error("Socket is not initialized");
    }
  };

  // Only show the start button if the user is the host
  const startGame = () => {
    console.log(
      "Start Game button clicked, emitting startGame event with lobbyCode:",
      lobbyCode
    );
    if (socket) {
      socket.emit("startGame", { lobbyCode });
    } else {
      console.error("Socket is not initialized");
    }
  };

  return (
    <div>
      <h2>Lobby {lobbyCode}</h2>

      {isHost && <button onClick={startGame}>Start Game</button>}

      <h3>Players in Lobby</h3>
      <p>{playerList.length}/10 players</p>
      <ul>
        {playerList.map((player) => (
          <li key={player.uid}>{player.displayName}</li>
        ))}
      </ul>

      {draftState ? (
        <div>
          <p>Current Picks: {draftState.picks.join(", ")}</p>
        </div>
      ) : (
        <div>
          <p>Waiting for draft to start...</p>
        </div>
      )}

      {/* Example list of champions to pick from */}
      <button onClick={() => pickChampion("Ahri")}>Pick Ahri</button>
      <button onClick={() => pickChampion("Garen")}>Pick Garen</button>
      {/* Add more champions as needed */}
    </div>
  );
}

export default Lobby;
//end

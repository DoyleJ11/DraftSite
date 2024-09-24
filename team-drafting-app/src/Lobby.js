// src/Lobby.js

import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext"; // Import AuthContext

function Lobby() {
  const socket = useContext(SocketContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext); // Access currentUser

  // Extract lobbyCode and isHost from location.state
  const lobbyCode = location.state?.lobbyCode || "";
  const isHost = location.state?.isHost || false;

  const [draftState, setDraftState] = useState(null);
  const [playerList, setPlayerList] = useState([]);
  const [settings, setSettings] = useState({});
  const [newSettings, setNewSettings] = useState({
    maxPlayers: 10,
    draftType: "Standard",
    gameChoice: "League of Legends",
  });
  const [errorMessage, setErrorMessage] = useState(null);

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

    // Listen for settingsUpdated event
    const handleSettingsUpdated = (updatedSettings) => {
      console.log("Received settingsUpdated event:", updatedSettings);
      setSettings(updatedSettings);
    };

    socket.on("settingsUpdated", handleSettingsUpdated);

    // Listen for gameStarted event
    const handleGameStart = (lobbyCode) => {
      console.log("Received gameStarted event with lobbyCode:", lobbyCode);
      navigate("/draft", {
        state: { lobbyCode: lobbyCode },
      });
    };

    socket.on("gameStarted", handleGameStart);

    // Listen for kicked event
    const handleKicked = () => {
      alert("You have been kicked from the lobby.");
      navigate("/"); // Redirect to home
    };

    socket.on("kicked", handleKicked);

    // **Added: Listen for error events**
    const handleError = (message) => {
      setErrorMessage(message);
    };

    socket.on("error", handleError);

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
      socket.off("settingsUpdated", handleSettingsUpdated);
      socket.off("gameStarted", handleGameStart);
      socket.off("kicked", handleKicked);
      socket.off("error", handleError);
    };
  }, [socket, lobbyCode, navigate]);

  // **New Effect to Monitor currentUser**
  useEffect(() => {
    if (!currentUser) {
      // User is logged out, navigate to home
      navigate("/");
    }
  }, [currentUser, navigate]);

  // **Prevent rendering if currentUser is null**
  if (!currentUser) {
    return null;
  }

  const pickChampion = (champion) => {
    if (socket) {
      socket.emit("pickChampion", { lobbyCode, champion });
    } else {
      console.error("Socket is not initialized");
    }
  };

  const toggleReady = () => {
    if (socket) {
      socket.emit("toggleReady", { lobbyCode });
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

  // Handle kicking a player
  const kickPlayer = (uid) => {
    if (socket) {
      socket.emit("kickPlayer", { lobbyCode, uid });
    }
  };

  // Handle updating lobby settings
  const updateLobbySettings = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit("updateSettings", { lobbyCode, newSettings });
    }
  };

  // Handle input changes for lobby settings
  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setNewSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleGoHome = () => {
    navigate("/"); // Navigate to home screen
  };

  // **Determine if all players are ready**
  const allPlayersReady = playerList.every((player) => player.ready);

  // **Get the current player**
  const currentPlayer = playerList.find(
    (player) => player.uid === currentUser.uid
  );

  return (
    <div>
      <h2>Lobby {lobbyCode}</h2>
      <button onClick={handleGoHome}>Home</button> {/* Add Home button */}
      {errorMessage && <p className="error">{errorMessage}</p>}
      {isHost && currentUser && (
        <button onClick={startGame} disabled={!allPlayersReady}>
          Start Game
        </button>
      )}
      {currentUser && (
        <button onClick={toggleReady}>
          {currentPlayer && currentPlayer.ready ? "Unready" : "Ready"}
        </button>
      )}
      {isHost && currentUser && (
        <div>
          <h3>Lobby Settings</h3>
          <form onSubmit={updateLobbySettings}>
            <label>
              Max Players:
              <input
                type="number"
                name="maxPlayers"
                value={newSettings.maxPlayers}
                onChange={handleSettingChange}
                min="2"
                max="10"
              />
            </label>
            <br />
            <label>
              Draft Type:
              <select
                name="draftType"
                value={newSettings.draftType}
                onChange={handleSettingChange}
              >
                <option value="Standard">Standard</option>
                <option value="Blind Pick">Blind Pick</option>
                {/* Add more draft types as needed */}
              </select>
            </label>
            <br />
            <label>
              Game Choice:
              <select
                name="gameChoice"
                value={newSettings.gameChoice}
                onChange={handleSettingChange}
              >
                <option value="Valorant">Valorant</option>
                <option value="League of Legends">League of Legends</option>
                <option value="Overwatch">Overwatch</option>
              </select>
            </label>
            <br />
            <button type="submit">Update Settings</button>
          </form>
        </div>
      )}
      {/* Display Players in Lobby for everyone */}
      <div>
        <h3>Players in Lobby</h3>
        {
          <p>
            {playerList.length}/{settings?.maxPlayers || 10} players
          </p>
        }
        <ul>
          {playerList.map((player) => (
            <li key={player.uid}>
              {player.displayName} {player.ready ? "(Ready)" : "(Not Ready)"}
              {/* Show kick button only to host and not for themselves */}
              {isHost && currentUser && player.uid !== currentUser.uid && (
                <>
                  <button onClick={() => kickPlayer(player.uid)}>Kick</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
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

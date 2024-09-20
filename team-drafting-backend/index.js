// team-drafting-backend/index.js

const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin with your service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware to authenticate sockets
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      socket.user = decodedToken;
      next();
    })
    .catch((error) => {
      console.error("Authentication error:", error);
      next(new Error("Authentication error"));
    });
});

const lobbies = {}; // Key: lobbyCode, Value: lobby data

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}, user: ${socket.user.uid}`);

  // Handle lobby creation
  socket.on("createLobby", () => {
    const lobbyCode = generateLobbyCode();
    lobbies[lobbyCode] = {
      host: socket.id,
      players: [
        {
          id: socket.id,
          uid: socket.user.uid,
          displayName: socket.user.name || socket.user.email || socket.user.uid,
        },
      ],
      draftState: {
        picks: [],
      },
    };
    socket.lobbyCode = lobbyCode;
    socket.join(lobbyCode);
    socket.emit("lobbyCreated", lobbyCode);
    console.log(
      `Lobby ${lobbyCode} created by ${socket.user.uid} (${socket.id})`
    );

    io.to(lobbyCode).emit("playersUpdated", lobbies[lobbyCode].players);
  });

  // Handle joining a lobby
  socket.on("joinLobby", ({ lobbyCode }) => {
    const lobby = lobbies[lobbyCode];
    if (lobby) {
      socket.lobbyCode = lobbyCode;

      // Check if the player is already in the lobby
      const isPlayerInLobby = lobby.players.some(
        (player) => player.uid === socket.user.uid
      );

      if (!isPlayerInLobby) {
        lobby.players.push({
          id: socket.id,
          uid: socket.user.uid,
          displayName: socket.user.name || socket.user.email || socket.user.uid,
        });
      } else {
        console.log(`User ${socket.user.uid} is already in lobby ${lobbyCode}`);
      }

      socket.join(lobbyCode);
      socket.emit("lobbyJoined", lobbyCode);
      console.log(
        `Socket ${socket.id} (${socket.user.uid}) joined lobby ${lobbyCode}`
      );

      io.to(lobbyCode).emit("playersUpdated", lobby.players);
    } else {
      socket.emit("error", "Lobby not found");
    }
  });

  // Handle re-joining a lobby room
  socket.on("joinLobbyRoom", ({ lobbyCode }) => {
    const lobby = lobbies[lobbyCode];
    if (lobby) {
      socket.lobbyCode = lobbyCode;

      // Check if the player is already in the lobby
      const isPlayerInLobby = lobby.players.some(
        (player) => player.uid === socket.user.uid
      );

      if (!isPlayerInLobby) {
        lobby.players.push({
          id: socket.id,
          uid: socket.user.uid,
          displayName: socket.user.name || socket.user.email || socket.user.uid,
        });
      } else {
        console.log(`User ${socket.user.uid} is already in lobby ${lobbyCode}`);
      }

      socket.join(lobbyCode);
      console.log(`Socket ${socket.id} re-joined lobby room ${lobbyCode}`);

      // Send the updated player list to all players in the lobby
      io.to(lobbyCode).emit("playersUpdated", lobby.players);
    } else {
      socket.emit("error", "Lobby not found");
    }
  });

  // Handle leaving a lobby
  socket.on("leaveLobby", ({ lobbyCode }) => {
    handleLeaveLobby(socket, lobbyCode);
  });

  // Function to handle a player leaving a lobby
  function handleLeaveLobby(socket, lobbyCode) {
    const lobby = lobbies[lobbyCode];
    if (lobby) {
      // Remove player from lobby's player list
      const index = lobby.players.findIndex(
        (player) => player.uid === socket.user.uid
      );
      if (index !== -1) {
        lobby.players.splice(index, 1);
      }

      // Leave the socket room
      socket.leave(lobbyCode);

      // Clear socket.lobbyCode
      delete socket.lobbyCode;

      // If the lobby is empty, delete it
      if (lobby.players.length === 0) {
        delete lobbies[lobbyCode];
        console.log(`Lobby ${lobbyCode} deleted because it is empty`);
      } else {
        // Notify remaining players about the updated player list
        io.to(lobbyCode).emit("playersUpdated", lobby.players);
      }

      console.log(`Socket ${socket.id} left lobby ${lobbyCode}`);
    } else {
      console.log(`Lobby ${lobbyCode} not found for socket ${socket.id}`);
    }
  }

  // Handle champion pick
  socket.on("pickChampion", ({ lobbyCode, champion }) => {
    const lobby = lobbies[lobbyCode];
    if (lobby) {
      lobby.draftState.picks.push(champion);
      // Emit updated draft state to all players in the lobby
      io.to(lobbyCode).emit("updateDraft", lobby.draftState);
      console.log(`Champion ${champion} picked in lobby ${lobbyCode}`);
    } else {
      socket.emit("error", "Lobby not found");
    }
  });

  // Handle starting the game
  socket.on("startGame", ({ lobbyCode }) => {
    console.log(`Received startGame event for lobbyCode: ${lobbyCode}`);
    const lobby = lobbies[lobbyCode];
    if (lobby) {
      io.to(lobbyCode).emit("gameStarted", lobbyCode);
      console.log(`Emitting gameStarted event to lobby ${lobbyCode}`);
    } else {
      socket.emit("error", "Lobby not found");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    const lobbyCode = socket.lobbyCode;
    if (lobbyCode) {
      // Call the same logic as leaveLobby
      handleLeaveLobby(socket, lobbyCode);
    }
  });
});

// Function to generate a unique lobby code
function generateLobbyCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Define a simple route
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

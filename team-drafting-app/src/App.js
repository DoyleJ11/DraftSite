// src/App.js

import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext"; // Import AuthContext
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import Lobby from "./Lobby";
import CreateLobby from "./CreateLobby";
import JoinLobby from "./JoinLobby";
import Draft from "./Draft";
import SignUp from "./SignUp"; // Import SignUp component
import Login from "./Login"; // Import Login component

function App() {
  const socket = useContext(SocketContext);
  const { currentUser } = useContext(AuthContext); // Get currentUser from AuthContext

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        // Optionally navigate to the home page or update UI as needed
      })
      .catch((error) => {
        console.error("Error logging out:", error);
        // Handle errors here
      });
  };

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        {currentUser ? (
          // Show Log Out button if user is logged in
          <button onClick={handleLogout}>Log Out</button>
        ) : (
          // Optionally, add links to Sign Up and Login pages
          <>
            <Link to="/signup">Sign Up</Link>
            <Link to="/login">Log In</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/join-lobby" element={<JoinLobby />} />
        <Route path="/draft" element={<Draft />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {/* Define other routes here */}
    </Router>
  );
}

function Home() {
  const navigate = useNavigate();
  const socket = useContext(SocketContext); // Access socket
  const { currentUser } = useContext(AuthContext);

  const handleCreateLobby = () => {
    if (socket) {
      socket.emit("createLobby");
      socket.on("lobbyCreated", (code) => {
        navigate("/lobby", { state: { lobbyCode: code, isHost: true } });
        socket.off("lobbyCreated"); // Clean up the event listener
      });
    } else {
      console.error("Socket is not initialized");
    }
  };

  const handleJoinLobby = () => {
    navigate("/join-lobby");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  if (!currentUser) {
    // User is not logged in
    return (
      <div>
        <h1>Welcome! Please Sign Up or Log In.</h1>
        <button onClick={handleSignUp}>Sign Up</button>
        <button onClick={handleLogin}>Log In</button>
      </div>
    );
  } else {
    // User is logged in
    return (
      <div>
        <h1>Join a lobby or Create a new one.</h1>
        <button onClick={handleCreateLobby}>Create Lobby</button>
        <button onClick={handleJoinLobby}>Join Lobby</button>
      </div>
    );
  }
}

export default App;

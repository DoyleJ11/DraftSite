// src/NavBar.js

import React from "react";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function LogOut() {
  const navigate = useNavigate();
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
        navigate("/");
        // Redirect or update UI as needed
      })
      .catch((error) => {
        console.error("Error logging out:", error);
        // Handle errors here
      });
  };

  return (
    <nav>
      {/* Other navigation links */}
      <button onClick={handleLogout}>Log Out</button>
    </nav>
  );
}

export default LogOut;
//end

// src/NavBar.js

import React from "react";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";

function NavBar() {
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out");
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

export default NavBar;
//end

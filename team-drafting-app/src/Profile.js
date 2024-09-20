// src/Profile.js

import React, { useState, useContext } from "react";
import { auth } from "./firebaseConfig";
import { updateProfile } from "firebase/auth";
import { AuthContext } from "./AuthContext";

function Profile() {
  const { currentUser } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || ""
  );

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProfile(auth.currentUser, { displayName })
      .then(() => {
        alert("Profile updated.");
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
      });
  };

  return (
    <div>
      <h2>Your Profile</h2>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default Profile;
//end

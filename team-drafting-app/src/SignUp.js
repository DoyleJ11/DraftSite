// src/SignUp.js

import React, { useState } from "react";
import { auth } from "./firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const handleSignUp = (e) => {
    e.preventDefault();
    // Create user with email and password
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User account created in:", userCredential.user);
        navigate("/"); // Redirect to the home page
        // Update the user's display name
        return updateProfile(userCredential.user, {
          displayName: displayName,
        });
      })
      .then(() => {
        // User profile updated successfully
        console.log("User signed up:", auth.currentUser);
        // Redirect or update UI as needed
      })
      .catch((error) => {
        console.error("Error signing up:", error);
        // Handle errors here
      });
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;
//end

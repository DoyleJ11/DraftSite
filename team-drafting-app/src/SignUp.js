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

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User account created:", userCredential.user);

      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
      console.log("User profile updated:", auth.currentUser);

      // Force token refresh
      await auth.currentUser.getIdToken(true);

      // Redirect to the home page
      navigate("/"); // Ensure this happens after profile update
    } catch (error) {
      console.error("Error signing up:", error);
      // Handle errors here (e.g., set an error message in state)
    }
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
          required // Ensure the display name is provided
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required // Ensure the email is provided
        />
        <input
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required // Ensure the password is provided
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;

import React, { useState } from "react";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage("");
    // Sign in user with email and password
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User logged in:", userCredential.user);
        navigate("/"); // Redirect to the home page
      })
      .catch((error) => {
        console.error("Error logging in:", error);

        switch (error.code) {
          case "auth/invalid-credential":
            setErrorMessage("Invalid credentials. Please try again.");
            break;
          case "auth/user-not-found":
            setErrorMessage("No user found with this email.");
            break;
          case "auth/invalid-email":
            setErrorMessage("Invalid email address.");
            break;
          default:
            setErrorMessage("An error occurred. Please try again later.");
        }
      });
  };

  return (
    <div>
      <h2>Log In</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Log In</button>
        {errorMessage && <p className="error">{errorMessage}</p>}
      </form>
    </div>
  );
}

export default Login;
//end

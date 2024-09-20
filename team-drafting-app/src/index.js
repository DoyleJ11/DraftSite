// src/index.js

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./AuthContext"; // Import AuthProvider
import { SocketProvider } from "./SocketContext"; // Import SocketProvider

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <SocketProvider>
      <App />
    </SocketProvider>
  </AuthProvider>
);
//end

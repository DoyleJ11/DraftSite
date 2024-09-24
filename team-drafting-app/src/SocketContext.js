// src/SocketContext.js

import React, { createContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { auth } from "./firebaseConfig";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketInstance;

    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        // Disconnect existing socket if any
        if (socketInstance) {
          socketInstance.disconnect();
        }
        // Initialize new socket with updated token
        socketInstance = io("http://localhost:8080", {
          auth: {
            token: idToken,
          },
        });

        setSocket(socketInstance);

        socketInstance.on("connect", () => {
          console.log(`Connected to server with ID: ${socketInstance.id}`);
        });

        // Handle socket disconnection
        socketInstance.on("disconnect", () => {
          console.log("Socket disconnected");
        });
      } else {
        // User is logged out, disconnect socket
        if (socketInstance) {
          socketInstance.disconnect();
          socketInstance = null;
        }
        setSocket(null);
      }
    });

    return () => {
      // Clean up on unmount
      if (socketInstance) {
        socketInstance.disconnect();
      }
      unsubscribe();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

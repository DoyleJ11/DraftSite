// src/SocketContext.js

import React, { createContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { auth } from "./firebaseConfig";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketInstance;

    const initializeSocket = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const idToken = await user.getIdToken();
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
          if (socketInstance) {
            socketInstance.disconnect();
            setSocket(null);
          }
        }
      });
    };

    initializeSocket();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
//end

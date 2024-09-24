// src/Draft.js

import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Grid,
  Button,
  Typography,
  CircularProgress,
  Container,
} from "@mui/material";

function Draft() {
  const socket = useContext(SocketContext);
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const lobbyCode = location.state?.lobbyCode || "";

  const [champions, setChampions] = useState([]);
  const [draftState, setDraftState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    // Fetch champion data from the backend
    fetch("http://localhost:8080/api/champions")
      .then((response) => response.json())
      .then((data) => {
        setChampions(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching champions:", error);
        setLoading(false);
      });

    // Listen for draft state updates
    socket.on("updateDraft", (state) => {
      setDraftState(state);
    });

    // Clean up on unmount
    return () => {
      socket.off("updateDraft");
    };
  }, [socket]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Draft
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {champions.map((champion) => (
            <Grid item xs={2} key={champion.id}>
              <Button variant="contained" fullWidth>
                {champion.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Draft;

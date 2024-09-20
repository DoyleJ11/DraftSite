import io from "socket.io-client";
import { auth } from "./firebaseConfig";

let socket;

auth.onAuthStateChanged((user) => {
  if (user) {
    user.getIdToken().then((idToken) => {
      socket = io("http://localhost:8080", {
        auth: {
          token: idToken,
        },
      });
      // Set up socket event listeners here
    });
  } else {
    if (socket) {
      socket.disconnect();
    }
  }
});

export { socket };
//end

import { io } from "socket.io-client";

let socket = null;

export const connectToEEGServer = () => {
  if (!socket) {
    socket = io("http://localhost:3000"); // backend URL
  }
  return socket;
};

export const getSocket = () => socket;

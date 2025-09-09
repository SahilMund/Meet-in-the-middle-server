// socket.js
import { Server } from "socket.io";

let io;
const userSockets = new Map(); // userId -> Set of socketIds
const socketToUser = new Map(); // socketId -> userId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // your FE origin
      //   methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 🔒 Authenticate with JWT before register
    socket.on("register", (userId) => {
      if (!userId) return;

      // map userId -> socketId
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      // map socketId -> userId
      socketToUser.set(socket.id, userId);

      console.log(`User ${userId} registered on socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
          }
        }
        socketToUser.delete(socket.id);
      }
      console.log("User disconnected:", socket.id);
    });
  });
};

// Broadcast to all sockets of a user
export const sendNotification = (userId, notification) => {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  sockets.forEach((socketId) => {
    io.to(socketId).emit("notification", notification);
  });
};

export const getIO = () => io;

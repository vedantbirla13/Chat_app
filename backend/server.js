import express from "express";
import chats from "./data/data.js";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import colors from "colors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

dotenv.config({
  path: "./config/config.env",
});

// Connect database
connectDB();

// Using Middlewares
app.use(
  cors({
    credentials: true,
    origin: ["process.env.FRONTEND_URI"],//," https://chatify-boo7.onrender.com/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("API is running");
// });

// Importing routes
import userRoutes from "./Routes/userRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";
import messageRoutes from "./Routes/messageRoutes.js";
import { errorHandler, notFound } from "./middlerware/middleware.js";
import path from "path";

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// -------------------------------------Deployment-------------------------------------------


// Deploying on render 
// __dirname: The directory we currently are in i.e C:\Users\Vedant\Desktop\React\chat_app\backend
// But we want C:\Users\Vedant\Desktop\React\chat_app
// Hence we go back on directory back using .. in the root directory and go in the /frontend/build
// And grab the index.html where the minifies version of our website is present

const __dirname = path.resolve();
// const rootDir = path.resolve(__dirname, '..');

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// console.log((path.resolve(rootDir, "frontend", "build", "index.html")))
// -------------------------------------Deployment-------------------------------------------

// Error middlewares
app.use(notFound);
app.use(errorHandler);

// Create new server
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://chatify-xzz5.onrender.com",
  },
});

// Create connection
io.on("connection", (socket) => {
  console.log("Connected to socket");

  socket.on("disconnect", () => {
    console.log("Disconnected from socket");
  });

  // Sending the logged user id
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Joining a room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined Room: " + room);
  });

  // Sending message to the joined roomś
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id !== newMessageRecieved.sender._id) {
        socket.in(user._id).emit("message recieved", newMessageRecieved);
      }
    });

    // console.log(chat)
  });

  // Socket for typing
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
  socket.off("Setup", () => {
      console.log("User disconnected");
      socket.leave(userData._id)
  })
});


// Connection request
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Socket.io is listening on PORT ${PORT}`.green.italic);
});

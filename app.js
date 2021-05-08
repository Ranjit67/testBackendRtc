const express = require("express");
const socket = require("socket.io");

const app = express();
const http = require("http");
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: "*",
  },
});
const listPeople = [];
io.on("connection", (socket) => {
  socket.on("new people join", (payload) => {
    listPeople.push(socket.id);
    const exceptHimself = listPeople.filter((id) => id !== socket.id);
    socket.emit("exited people", exceptHimself);
    socket.broadcast.emit("send to every one", socket.id);
  });
  socket.on("send signal to other user", (payload) => {
    const { user, sdp } = payload;
    // console.log(user);
    io.to(user).emit("signal receive user", { user: socket.id, sdp });
  });
  socket.on("return signal", (payload) => {
    const { sdp, sendTo, candidate } = payload;
    io.to(sendTo).emit("return signal to origin", {
      sdp,
      user: socket.id,
      candidate,
    });
  });
  socket.on("disconnect", () => {
    // console.log(socket.id);
  });
});
//state
server.listen(process.env.PORT || 5000, () => {
  console.log("The port 5000 is ready to start");
});

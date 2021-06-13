// src/server.js

const express = require("express")();
const server = require("http").Server(express);
const io = require("socket.io")(server);
const next = require("next");

const port = process.env.PORT || 8888;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// const {
//   createRoom,
//   joinRoom,
//   checkRoom,
//   sendCode,
//   getResult,
//   sendSolution,
// } = require("./controller");

// io.on("connect", (socket) => {
//   socket.on("CREATE_ROOM", (type) => createRoom(type, socket));
//   socket.on("JOIN_ROOM", (pin) => joinRoom(pin, socket));
//   socket.on("CHECK_ROOM", (pin) => checkRoom(pin, socket));
//   socket.on("SEND_CODE", ({ type, code }) =>
//     sendCode(type, code, socket.id, io)
//   );
//   socket.on("GET_RESULT", (pin) => getResult(pin, socket));
//   socket.on("SEND_RESOLUTION", ({ order, pin }) =>
//     sendSolution(order, pin, io)
//   );
// });

app.prepare().then(() => {
  express.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

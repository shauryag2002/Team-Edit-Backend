const mongoose = require("mongoose");
const Document = require("./models/Document");
const docRoute = require("./routes/docRoute");
const express = require("express");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const dotenv = require("dotenv");
const app = express();
// const http = require("http");
// const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(6100, { cors: true });
const xss = require("xss");
dotenv.config();
mongoose.connect(process.env.mongo_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const io = require("socket.io")(6100, {
//   cors: {
//     origin: "*",
//   },
// });

const defaultValue = "";

const users = {};

const socketToRoom = {};
sanitizeString = (str) => {
  return xss(str);
};

connections = {};
messages = {};
timeOnline = {};
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId, name, ownerId) => {
    const document = await findOrCreateDocument(documentId, name, ownerId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    // socket.on("send-changes", (delta) => {
    //   socket.broadcast.to(documentId).emit("receive-changes", delta);
    // });

    socket.on("save-document", async (data) => {
      // console.log(data);
      await Document.findByIdAndUpdate(documentId, { data });
      socket.broadcast.to(documentId).emit("receive-changes", data);
    });
  });
  socket.on("join room", (roomID) => {
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
    }
  });
});

async function findOrCreateDocument(id, name, ownerId) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({
    _id: id,
    name,
    data: defaultValue,
    owner: ownerId,
  });
}
app.use("/api/auth", authRoute);
app.use("/api/document", docRoute);
app.use("/api/user", userRoute);
app.listen(6000, () => {
  console.log("listening on http://localhost:6000");
});
module.exports = io;

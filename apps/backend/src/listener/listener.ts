import { createServer } from "node:http";

import cors from "cors";
import express from "express";
import { Server } from "socket.io";

const app = express();

app.use(
    cors({
        origin: "*",
    })
);

const server = createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("a user connected");
});

server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});

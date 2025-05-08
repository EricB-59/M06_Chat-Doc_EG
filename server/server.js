import express from "express";
import cors from "cors";
import logger from "morgan";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import fs from "node:fs";
import { json } from "node:stream/consumers";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const port = 8000;

app.use(cors());
app.use(express.json());
app.use(logger("dev"));

const clients = new Set();

wss.on("connection", function connection(ws) {
  console.log("User connected");
  clients.add(ws);

  ws.on("message", function message(data) {
    const messageStr = data.toString();
    console.log("received: %s", messageStr);

    const messageObj = JSON.parse(messageStr);

    clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify(messageObj));
      }
    });
  });

  ws.on("close", function () {
    clients.delete(ws);
    console.log("User disconnected");
  });

  ws.on("error", console.error);
});

app.post("/login", (req, res) => {
  const recivedData = req.body;

  const file = fs.readFile("./database/data.json", null, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const dataJson = JSON.parse(data);

    console.log(dataJson);
    if (dataJson.users[1].name == recivedData.name) {
      console.log("Nombre encontrado");
    }
  });
});

server.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

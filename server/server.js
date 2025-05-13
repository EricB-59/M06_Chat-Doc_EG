import express from "express";
import cors from "cors";
import logger from "morgan";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import fs, { readFile } from "node:fs";
import { json } from "node:stream/consumers";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const port = 8000;
const dataFilePath = "./database/data.json";

app.use(cors());
app.use(express.json());
app.use(logger("dev"));

const clients = new Set();

wss.on("connection", function connection(ws) {
  console.log("User connected");
  clients.add(ws);

  // Take messages from the database and send to the user
  fs.readFile(dataFilePath, null, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const dataParsed = JSON.parse(data);
    const messages = dataParsed['messages'];

    if (messages.length >= 1) {
      ws.send(JSON.stringify(messages))
    }
  })

  ws.on("message", function message(data) {
    const messageStr = data.toString();
    const messageObj = JSON.parse(messageStr);

    fs.readFile(dataFilePath, 'utf8', (err, fileData) => {
      if (err) {
        console.error("Error al leer el archivo:", err);
        return;
      }

      try {
        const dataParsed = JSON.parse(fileData);

        // Añadir el nuevo mensaje al array de mensajes
        dataParsed.messages.push(messageObj);

        // Guardar toda la estructura actualizada 
        fs.writeFile(dataFilePath, JSON.stringify(dataParsed, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
            console.error("Error al escribir el archivo:", writeErr);
          }
        });
      } catch (parseErr) {
        console.error("Error al parsear los datos del archivo:", parseErr);
      }
    });

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

  const file = fs.readFile(dataFilePath, null, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const dataJson = JSON.parse(data);

    dataJson['users'].map((user) => {
      if (user.name === recivedData.name && user.email === recivedData.email) {
        res.status(201).json(user);
      }
    });

  });
});

server.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

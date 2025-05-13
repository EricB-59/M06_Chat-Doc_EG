import express from "express";
import cors from "cors";
import logger from "morgan";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import fs, { readFile } from "node:fs";
import { json } from "node:stream/consumers";
import path from "path";

const app = express();
const server = createServer(app);
const wssChat = new WebSocketServer({ noServer: true });
const wssDocument = new WebSocketServer({ noServer: true });
const port = 8000;
const dataFilePath = "./database/data.json";
const documentFilePath = "./database/document.json";

app.use(cors());
app.use(express.json());
app.use(logger("dev"));

// Asegurar que existe la carpeta database y los archivos necesarios
const ensureDatabaseFiles = () => {
  // Asegurar que existe la carpeta database
  if (!fs.existsSync("./database")) {
    fs.mkdirSync("./database", { recursive: true });
  }

  // Asegurar que existe el archivo data.json
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(
      dataFilePath,
      JSON.stringify({ messages: [], users: [] }, null, 2),
      "utf8"
    );
  }

  // Asegurar que existe el archivo document.json
  if (!fs.existsSync(documentFilePath)) {
    fs.writeFileSync(
      documentFilePath,
      JSON.stringify(
        {
          content:
            "Bienvenido al documento compartido.\n\nEste es un editor colaborativo en tiempo real.",
          lastEditor: "sistema",
          lastEdited: new Date().toISOString(),
          users: [],
        },
        null,
        2
      ),
      "utf8"
    );
  }
};

ensureDatabaseFiles();

// Estado del documento
let documentState = {
  content:
    "Bienvenido al documento compartido.\n\nEste es un editor colaborativo en tiempo real.",
  lastEditor: "sistema",
  lastEdited: new Date().toISOString(),
  users: [],
};

// Cargar el estado del documento
try {
  const documentData = fs.readFileSync(documentFilePath, "utf8");
  documentState = JSON.parse(documentData);
} catch (error) {
  console.error("Error al cargar el estado del documento:", error);
}

// Guardar el estado del documento
const saveDocumentState = () => {
  fs.writeFileSync(
    documentFilePath,
    JSON.stringify(documentState, null, 2),
    "utf8"
  );
};

// Clientes del chat
const chatClients = new Set();

// Configuración del WebSocket para el chat (manteniendo la funcionalidad existente)
wssChat.on("connection", function connection(ws) {
  console.log("User connected to chat");
  chatClients.add(ws);

  // Take messages from the database and send to the user
  fs.readFile(dataFilePath, null, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const dataParsed = JSON.parse(data);
    const messages = dataParsed["messages"];

    if (messages.length >= 1) {
      ws.send(JSON.stringify(messages));
    }
  });

  ws.on("message", function message(data) {
    const messageStr = data.toString();
    const messageObj = JSON.parse(messageStr);

    fs.readFile(dataFilePath, "utf8", (err, fileData) => {
      if (err) {
        console.error("Error al leer el archivo:", err);
        return;
      }

      try {
        const dataParsed = JSON.parse(fileData);

        // Añadir el nuevo mensaje al array de mensajes
        dataParsed.messages.push(messageObj);

        // Guardar toda la estructura actualizada
        fs.writeFile(
          dataFilePath,
          JSON.stringify(dataParsed, null, 2),
          "utf8",
          (writeErr) => {
            if (writeErr) {
              console.error("Error al escribir el archivo:", writeErr);
            }
          }
        );
      } catch (parseErr) {
        console.error("Error al parsear los datos del archivo:", parseErr);
      }
    });

    chatClients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify(messageObj));
      }
    });
  });

  ws.on("close", function () {
    chatClients.delete(ws);
    console.log("User disconnected from chat");
  });

  ws.on("error", console.error);
});

// Clientes del documento
const documentClients = new Set();

// Configuración del WebSocket para el documento
wssDocument.on("connection", function connection(ws) {
  console.log("User connected to document");
  documentClients.add(ws);

  // Enviar estado actual del documento al nuevo cliente
  ws.send(
    JSON.stringify({
      type: "INITIAL_STATE",
      document: documentState,
    })
  );

  ws.on("message", function message(data) {
    const messageStr = data.toString();
    const messageObj = JSON.parse(messageStr);

    // Manejar diferentes tipos de mensajes
    switch (messageObj.type) {
      case "UPDATE":
        // Actualizar el estado del documento
        documentState.content = messageObj.content;
        documentState.lastEditor = messageObj.editor;
        documentState.lastEdited = messageObj.timestamp;

        // Notificar a todos los clientes sobre la actualización
        documentClients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(
              JSON.stringify({
                type: "DOCUMENT_UPDATE",
                document: documentState,
              })
            );
          }
        });

        // Guardar el estado actualizado del documento
        saveDocumentState();
        break;

      case "JOIN":
        // Añadir usuario a la lista si no está ya
        if (!documentState.users.includes(messageObj.user)) {
          documentState.users.push(messageObj.user);

          // Notificar a todos los clientes sobre el usuario que se unió
          documentClients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(
                JSON.stringify({
                  type: "USERS_UPDATE",
                  users: documentState.users,
                })
              );
            }
          });

          // Guardar el estado actualizado del documento
          saveDocumentState();
        }
        break;

      case "LEAVE":
        // Eliminar usuario de la lista
        documentState.users = documentState.users.filter(
          (user) => user !== messageObj.user
        );

        // Notificar a todos los clientes sobre el usuario que se fue
        documentClients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(
              JSON.stringify({
                type: "USERS_UPDATE",
                users: documentState.users,
              })
            );
          }
        });

        // Guardar el estado actualizado del documento
        saveDocumentState();
        break;
    }
  });

  ws.on("close", function () {
    documentClients.delete(ws);
    console.log("User disconnected from document");
  });

  ws.on("error", console.error);
});

// Manejo de rutas para los WebSockets
server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (pathname === "/document") {
    wssDocument.handleUpgrade(request, socket, head, (ws) => {
      wssDocument.emit("connection", ws, request);
    });
  } else {
    // Por defecto, dirigir al chat (manteniendo compatibilidad)
    wssChat.handleUpgrade(request, socket, head, (ws) => {
      wssChat.emit("connection", ws, request);
    });
  }
});

app.post("/login", (req, res) => {
  const recivedData = req.body;

  const file = fs.readFile(dataFilePath, null, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const dataJson = JSON.parse(data);

    dataJson["users"].map((user) => {
      if (user.name === recivedData.name && user.email === recivedData.email) {
        res.status(201).json(user);
      }
    });
  });
});

server.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

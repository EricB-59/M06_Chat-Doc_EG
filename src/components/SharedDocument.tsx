import React from "react";
import { useState, useEffect, useRef } from "react";

// Tipo para el contenido del documento
type DocumentContent = {
  content: string;
  lastEditor: string;
  lastEdited: string;
  users: string[];
};

// Tipo para los mensajes del WebSocket
type DocumentMessage = {
  type: string;
  document?: DocumentContent;
  users?: string[];
  content?: string;
  editor?: string;
  user?: string;
  timestamp?: string;
};

function SharedDocument() {
  const [document, setDocument] = useState<DocumentContent>({
    content: "",
    lastEditor: "",
    lastEdited: "",
    users: [],
  });
  const [connected, setConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    const socket = new WebSocket(
      `ws://${window.location.hostname}:8000/document`
    );

    socket.onopen = () => {
      setConnected(true);
      setStatusMessage("Conectado al documento");

      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        socket.send(
          JSON.stringify({
            type: "JOIN",
            user: parsedUserData.name,
            timestamp: new Date().toISOString(),
          })
        );
      }
    };

    socket.onmessage = (event) => {
      try {
        const data: DocumentMessage = JSON.parse(event.data);
        const userData = localStorage.getItem("user");
        const parsedUser = userData ? JSON.parse(userData) : null;

        if (
          data.type === "DOCUMENT_UPDATE" &&
          data.document &&
          data.editor !== parsedUser?.name &&
          data.document.content !== document.content
        ) {
          setDocument(data.document);
        } else if (data.type === "USERS_UPDATE") {
          setDocument((prevDoc) => ({
            ...prevDoc,
            users: data.users ?? prevDoc.users,
          }));
        } else if (data.type === "INITIAL_STATE" && data.document) {
          setDocument(data.document);
        }
      } catch (error) {
        console.error("Error al procesar mensaje:", error);
        setStatusMessage("Error al procesar datos del servidor");
      }
    };

    socket.onerror = () => {
      setConnected(false);
      setStatusMessage("Error de conexión");
    };

    socket.onclose = () => {
      setConnected(false);
      setStatusMessage("Desconectado del servidor");
    };

    setWs(socket);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          socket.send(
            JSON.stringify({
              type: "LEAVE",
              user: parsedUserData.name,
              timestamp: new Date().toISOString(),
            })
          );
        }
        socket.close();
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocument((prev) => ({
      ...prev,
      content: e.target.value,
    }));
  };

  const handleBlur = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        ws.send(
          JSON.stringify({
            type: "UPDATE",
            content: document.content,
            editor: parsedUserData.name,
            timestamp: new Date().toISOString(),
          })
        );
        setStatusMessage("Cambios guardados");
      }
    }
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <article className="w-full h-full flex flex-col justify-between border border-gray-700 rounded-xl bg-gray-800 shadow-lg overflow-hidden">
      <div className="bg-gray-900 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div
            className={`h-3 w-3 ${
              connected ? "bg-green-500" : "bg-red-500"
            } rounded-full`}
          ></div>
          <h2 className="text-white font-medium">Documento Compartido</h2>
        </div>
        <div className="text-gray-400 text-xs">
          {connected ? (
            <span>
              En línea ({document.users.length}{" "}
              {document.users.length === 1 ? "usuario" : "usuarios"})
            </span>
          ) : (
            "Desconectado"
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="bg-gray-700 text-gray-300 text-xs px-4 py-1 text-center">
          {statusMessage}
        </div>
      )}

      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          {document.users.map((user, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-xs rounded-full text-gray-300"
            >
              {user}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8">
        <textarea
          ref={inputRef}
          value={document.content}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full h-full text-white text-2xl bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none "
          placeholder="Escribe algo aquí..."
        />
      </div>

      <div className="border-t border-gray-700 p-3 bg-gray-900 text-xs text-gray-400">
        {document.lastEditor && document.lastEdited ? (
          <div className="flex justify-between">
            <span>Última edición por: {document.lastEditor}</span>
            <span>{formatDateTime(document.lastEdited)}</span>
          </div>
        ) : (
          <div className="text-center">Sin cambios recientes</div>
        )}
      </div>
    </article>
  );
}

export default SharedDocument;

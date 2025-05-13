import React from "react";
import { useState, useEffect } from "react";
import MessageTemplate from "./MessageTemplate.tsx";

export type Message = {
  author: string;
  content: string;
  timestamp: string;
};

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000");

    socket.onopen = () => {
      setConnected(true);
      setMessages((prev) => [
        ...prev,
        {
          author: "system",
          content: "¡Conectado al chat exitosamente!",
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Manejar tanto arrays de mensajes como mensajes individuales
        if (Array.isArray(data)) {
          // Caso de múltiples mensajes (histórico)
          setMessages((prev) => [
            ...prev,
            ...data.map((msg) => ({
              ...msg,
              timestamp: msg.timestamp || new Date().toISOString(),
            })),
          ]);
        } else {
          // Caso de un solo mensaje
          const messageObj = {
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
          };
          setMessages((prev) => [...prev, messageObj]);
        }
      } catch (error) {
        console.error("Error al procesar mensaje recibido:", error);
        // Opcional: mostrar mensaje de error al usuario
        setMessages((prev) => [
          ...prev,
          {
            author: "system",
            content: "Error al procesar mensaje recibido",
            timestamp: new Date().toISOString(),
            id: `error-${Date.now()}`,
          },
        ]);
      }
    };

    socket.onerror = (error) => {
      console.error("Error de WebSocket:", error);
      setMessages((prev) => [
        ...prev,
        {
          author: "system",
          content: "Error de conexión",
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    socket.onclose = () => {
      console.log("WebSocket desconectado");
      setConnected(false);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (ws && message.trim() && ws.readyState === WebSocket.OPEN) {
      let userData;
      let local = localStorage.getItem("user");

      if (local) {
        userData = JSON.parse(local);
      }

      const messageObj = {
        author: userData.name,
        content: message,
        timestamp: new Date().toISOString(),
      };

      ws.send(JSON.stringify(messageObj));

      setMessage("");
    }
  };

  return (
    <article className="w-full h-full flex flex-col justify-between border border-gray-700 rounded-xl bg-gray-800 shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
          <h2 className="text-white font-medium">Chat en vivo</h2>
        </div>
        <div className="text-gray-400 text-xs">
          {messages.length > 0 ? "En línea" : "Esperando mensajes..."}
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        id="messages-container"
      >
        {messages.map((msg, index) => (
          <MessageTemplate key={index} message={msg} />
        ))}

        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-500 italic">
            Inicia una conversación...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="border-t border-gray-700 p-3 bg-gray-900"
      >
        <div className="flex items-center gap-2 rounded-full bg-gray-700 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
          <input
            id="inputMessage"
            name="inputMessage"
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 border-none focus:outline-none focus:ring-0"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoComplete="off"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 rounded-full p-2 text-white focus:outline-none transform transition-transform active:scale-95 disabled:opacity-50"
            disabled={!message.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </form>
    </article>
  );
}

export default Chat;

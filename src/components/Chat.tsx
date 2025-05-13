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
    <article className="w-full h-full flex justify-between flex-col border-2 border-secondary p-2 py-5 rounded-xl bg-slate-900">
      <li className="text-white list-none overflow-auto flex flex-col gap-2 px-4">
        {messages.map((msg, index) => (
          <MessageTemplate key={index} message={msg} />
        ))}
      </li>
      <form onSubmit={handleSend} className="px-2 flex gap-3 py-2">
        <input
          id="inputMessage"
          name="inputMessage"
          placeholder="Type a message"
          className="border-2 border-secondary w-full rounded-2xl p-2 text-white"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="w-8 cursor-pointer">
          <img src="icons/send.png" alt="" />
        </button>
      </form>
      <script></script>
    </article>
  );
}

export default Chat;

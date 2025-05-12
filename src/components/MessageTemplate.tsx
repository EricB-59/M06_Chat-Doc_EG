import React, { useEffect, useState } from "react";

type Message = {
  author: string;
  content: string;
  timestamp: string;
};

interface MessageTemplateProps {
  message: Message;
}

function MessageTemplate({ message }: MessageTemplateProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    // Obtener datos del usuario del localStorage
    const local = localStorage.getItem("user");
    if (local) {
      const userData = JSON.parse(local);
      // Comprobar si el autor del mensaje es el mismo usuario actual
      setIsCurrentUser(
        userData.author === message.author || userData.name === message.author
      );
    }
  }, [message.author]);

  // Definir las clases dependiendo de si es el usuario actual o no
  const bgColorClass = isCurrentUser ? "bg-blue-500" : "bg-secondary";

  return (
    <div className={`${bgColorClass} rounded-lg p-4 my-2 shadow-md`}>
      <div className="flex justify-between">
        <h2 className="font-bold">{message.author}</h2>
        <span className="text-white">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <h2 className="mt-2 break-words text-wrap">{message.content}</h2>
    </div>
  );
}

export default MessageTemplate;

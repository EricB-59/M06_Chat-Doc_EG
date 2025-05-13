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
  const bgColorClass = isCurrentUser ? "bg-blue-600" : "bg-gray-700";
  const alignmentClass = isCurrentUser ? "ml-auto" : "mr-auto";
  const maxWidthClass = "max-w-3/4";

  // Formatear la hora para mostrar solo horas y minutos
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Verificar si el mensaje tiene contenido
  const hasContent = message.content && message.content.trim().length > 0;

  return (
    <div
      className={`${alignmentClass} ${maxWidthClass} ${bgColorClass} rounded-lg p-4 my-3 shadow-lg transition-all duration-200`}
    >
      <div className="flex justify-between items-center mb-1">
        <h2 className="font-bold text-white text-sm">
          {isCurrentUser ? "Tú" : message.author}
          {isCurrentUser && (
            <span className="ml-2 text-xs bg-blue-800 px-2 py-0.5 rounded-full">
              Tú
            </span>
          )}
        </h2>
        <span className="text-gray-300 text-xs">{formattedTime}</span>
      </div>

      {hasContent && (
        <div className="mt-1 break-words text-wrap text-white">
          {message.content}
        </div>
      )}

      {!hasContent && (
        <div className="mt-1 italic text-gray-300 text-sm">Mensaje vacío</div>
      )}
    </div>
  );
}

export default MessageTemplate;

import React from "react";

type Message = {
  author: string;
  content: string;
  timestamp: string;
};

interface MessageTemplateProps {
  message: Message;
}

function MessageTemplate({ message }: MessageTemplateProps) {
  return (
    <div className="bg-special rounded-lg p-4 my-2 shadow-md">
      <div className="flex justify-between">
        <h2 className="font-bold">{message.author}</h2>
        <span className="text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <h2 className="mt-2 break-words overflow-wrap-anywhere text-wrap">
        {message.content}
      </h2>
    </div>
  );
}

export default MessageTemplate;

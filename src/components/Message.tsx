import React from "react";
import { Message } from "../types/message";

function Message(msg: Message) {
  return (
    <section>
      <h1>{msg.content}</h1>
      <h2>{msg.author}</h2>
      <span>{msg.timestamp}</span>
    </section>
  );
}

export default Message;

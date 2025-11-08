import { useState } from "react";
import DraggableChatButton from "./DraggableChatButton";
import ChatInterface from "./ChatInterface";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <DraggableChatButton onClick={() => setIsOpen(!isOpen)} hasUnread={false} />
      <ChatInterface isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatBot;

import { Message } from "../types/message";
import { useState } from "react";

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [isReasoningCollapsed, setIsReasoningCollapsed] = useState(message.isReasoningCollapsed);

  const toggleReasoning = () => {
    setIsReasoningCollapsed(!isReasoningCollapsed);
  };

  return (
    <div className={`message ${message.isUser ? "user-message" : "ai-message"}`}>
      {message.reasoningContent && (
        <>
          <span className="toggle-reasoning" onClick={toggleReasoning}>
            {isReasoningCollapsed ? "显示推理过程" : "隐藏推理过程"}
          </span>
          <div
            className={`reasoning-content ${isReasoningCollapsed ? "collapsed" : ""}`}>
            {message.reasoningContent}
          </div>
        </>
      )}
      {message.content}
    </div>
  );
};

export default MessageItem;

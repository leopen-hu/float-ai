import { Message } from "../types/message";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import "./MessageItem.css";
import { useTranslation } from "react-i18next";

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [isReasoningCollapsed, setIsReasoningCollapsed] = useState(
    message.isReasoningCollapsed
  );
  const { t } = useTranslation();

  const toggleReasoning = () => {
    setIsReasoningCollapsed(!isReasoningCollapsed);
  };

  return (
    <div
      className={`message ${message.isUser ? "user-message" : "ai-message"}`}>
      {message.reasoningContent && (
        <>
          <span className="toggle-reasoning" onClick={toggleReasoning}>
            {isReasoningCollapsed ? t("Show Reasoning") : t("Hide Reasoning")}
          </span>
          <div
            className={`reasoning-content ${
              isReasoningCollapsed ? "collapsed" : ""
            }`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}>
              {message.reasoningContent}
            </ReactMarkdown>
          </div>
        </>
      )}
      <div className="markdown-body">
        <ReactMarkdown
          components={{
            code(props) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { children, className, ref, ...rest } = props;
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <SyntaxHighlighter
                  {...rest}
                  PreTag="div"
                  children={String(children).replace(/\n$/, "")}
                  language={match[1]}
                  style={oneDark}
                />
              ) : (
                <code {...rest} className={className}>
                  {children}
                </code>
              );
            },
          }}
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MessageItem;

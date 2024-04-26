const ChatBubble = function ({
  isSentByMe,
  seen,
  updatedAt,
  sentAt,
  message,
}: {
  message: string;
  isSentByMe: boolean;
  seen?: boolean;
  updatedAt?: Date;
  sentAt: Date;
}) {
  return (
    <div className={`chat ${isSentByMe ? "chat-end" : "chat-start"}`}>
      <div className="chat-header">
        <time className="text-xs opacity-50">
          {updatedAt
            ? "update at: " + updatedAt.toLocaleTimeString()
            : sentAt.toLocaleTimeString()}
        </time>
      </div>
      <div
        className={`chat-bubble break-all text-balance ${
          isSentByMe ? "chat-bubble-primary" : "chat-bubble-secondary"
        }`}
      >
        {message}
      </div>
      <div className="chat-footer opacity-50">{seen && "Seen"}</div>
    </div>
  );
};

export default ChatBubble;

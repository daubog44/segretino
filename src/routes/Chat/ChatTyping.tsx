const ChatTyping = function ({}: {}) {
  return (
    <div className={`chat chat-start"`}>
      <div className={`chat-bubble chat-bubble-secondary`}>
        <span className="loading loading-dots loading-sm"></span>
      </div>
    </div>
  );
};

export default ChatTyping;

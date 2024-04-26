import ChatBtn from "@src/components/ChatBtn";
import { useStore } from "@src/store";

const Chats = function () {
  const { chats } = useStore();

  return (
    <>
      <div className="bg-base-300 divide-y divide-dashed">
        {chats?.map((ch) => (
          <div key={ch.chatTable.id + String(Math.random())}>
            {!ch.chatTable.isGroup && <ChatBtn chatId={ch.chatTable.id} />}
          </div>
        ))}
      </div>
    </>
  );
};

export default Chats;

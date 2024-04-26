import { useStore } from "@src/store";
import { Auth } from "@supabase/auth-ui-react";
import ChatImage from "@src/components/Avatar/Avatar";
import { Link } from "react-router-dom";

const ChatBtn = function ({ chatId }: { chatId: string }) {
  const { chats } = useStore();
  const chat = chats?.find((ch) => ch.chatTable.id === chatId);
  const { user } = Auth.useUser();
  if (!chat || !user) throw new Error("user not find");

  return (
    <Link to={"/home/" + user.id + "/" + chat.chatTable.id}>
      <button className="btn btn-square btn-outline">
        <ChatImage
          user={chat.partecipants[0].userPartecipant.user}
          isOnline={
            chat.partecipants[0].userPartecipant.partecipant.isOnline || false
          }
        />
      </button>
    </Link>
  );
};

export default ChatBtn;

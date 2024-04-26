import { useStore } from "@src/store";
import { IoIosStarOutline, IoMdStar } from "react-icons/io";
import { memo, useCallback } from "react";
import supabase from "@src/utils/supabase";
import Avatar from "./Avatar/Avatar";
import { Link } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";

const ChatBtn = function ({ chatId }: { chatId: string }) {
  const { user } = Auth.useUser();
  const { mePartecipant, updatePartecipantsChat, chats } = useStore();
  const chat = chats?.find((ch) => ch.chatTable.id === chatId);
  if (!chat) return;
  const updateStar = useCallback(
    async (val: boolean) => {
      if (!mePartecipant) return;
      const isStarredBefore = chat.mePartecipant.isStarred;
      updatePartecipantsChat(
        chat.chatTable.id,
        {
          isStarred: val,
        },
        true
      );
      const res = await supabase
        .from("partecipants_chats")
        .update({ isStarred: val })
        .eq("chat_id", chat.chatTable.id)
        .eq("partecipant_id", mePartecipant?.id)
        .select();
      if (res.error) {
        updatePartecipantsChat(
          chat.chatTable.id,
          {
            isStarred: isStarredBefore,
          },
          true
        );
        return;
      }
    },
    [chat, mePartecipant]
  );
  if (!user) return;
  return (
    <div className="w-full flex justify-between items-center py-3 px-2">
      <div className="flex items-center gap-3">
        <Link to={"/home/" + user.id + "/" + chat.chatTable.id}>
          <button className="btn btn-square btn-outline">
            <Avatar
              user={chat.partecipants[0].userPartecipant.user}
              isOnline={
                chat.partecipants[0].userPartecipant.partecipant.isOnline ||
                false
              }
            />
          </button>
        </Link>
        <span>
          {chat.partecipants[0].userPartecipant.user.user_metadata.userName}
        </span>
      </div>
      <div>
        <div className="">last message{/*TODO last message */}</div>
      </div>

      <div>
        <label
          className={`swap ${chat.mePartecipant.isStarred && "swap-active"}`}
        >
          <div className="swap-on">
            <IoMdStar className="h-12 w-12" onClick={() => updateStar(true)} />
          </div>
          <div className="swap-off">
            <IoIosStarOutline
              className="h-12 w-12"
              onClick={() => updateStar(false)}
            />
          </div>
        </label>
      </div>
    </div>
  );
};

export default memo(ChatBtn);

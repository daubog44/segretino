import { useStore } from "@src/store";
import { Tables } from "@src/types/supabase";
import { subscirbeToMessages } from "@src/utils/channels";
import supabase, { addMessageCallBack } from "@src/utils/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect } from "react";

const useSubscribeToMessages = function () {
  const { mePartecipant, updatePartecipantsChat, chats } = useStore();

  useEffect(() => {
    const channels: RealtimeChannel[] = [];
    if (!mePartecipant?.id || !chats) return;
    for (let chat of chats) {
      const chs = subscirbeToMessages(
        mePartecipant.id,
        chat.chatTable.id,
        chat,
        async (
          payload,
        ) => {
          await Promise.all([
            supabase
              .from("partecipants_chats")
              .update({ isTyping: false })
              .eq("partecipant_id", mePartecipant.id),
            addMessageCallBack(
              payload.new as Tables<"encrypted_messages">,
              chat.chatTable.id,
            ),
          ]);
        },
        (
          payload,
        ) => {
          const pay = payload.new as Tables<"partecipants_chats">;
          updatePartecipantsChat(chat.chatTable.id, {
            isTyping: pay.isTyping,
            hasLeaved: pay.hasLeaved,
            ...(pay.role && { role: pay.role }),
          });
        },
      );
      channels.push(...chs);
    }

    channels.forEach((ch) => ch.subscribe());
    return () => {
      channels.forEach((ch) => ch.unsubscribe());
    };
  }, [mePartecipant, chats]);
};

export default useSubscribeToMessages;

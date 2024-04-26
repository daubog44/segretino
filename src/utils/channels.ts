import { Chat } from "@src/store";
import supabase from "./supabase";
import {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { Tables } from "@src/types/supabase";

export const subscirbeToMessages = (
  mePartecipantId: string,
  channelId: string,
  chat: Chat,
  callBackOnMessageReceive: (
    payload: RealtimePostgresInsertPayload<{
      [key: string]: any;
    }>,
  ) => void | Promise<void>,
  callBackOnPaUpdate: (
    payload: RealtimePostgresUpdatePayload<{
      [key: string]: any;
    }>,
  ) => void | Promise<void>,
) => {
  const channel = supabase.channel(channelId + "-messages");
  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "encrypted_messages",
      filter: "recipient_id=eq." + mePartecipantId,
    },
    (payload) => {
      (async () => {
        const enMsg = payload.new as Tables<"encrypted_messages">;
        if (!enMsg.message_ref) return;
        const { data } = await supabase.from("messages").select().eq(
          "id",
          enMsg.message_ref,
        );
        if (data && data[0].chat === chat.chatTable.id) {
          callBackOnMessageReceive(payload);
        }
      })();
    },
  );
  const channel2 = supabase.channel(channelId + "-pa");
  channel2.on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "partecipants_chats",
      filter: "partecipant_id=eq." +
        chat.partecipants[0].partecipant.partecipant_id,
    },
    (payload) => {
      (async () => {
        const enMsg = payload.new as Tables<"encrypted_messages">;
        if (!enMsg.message_ref) return;
        const { data } = await supabase.from("messages").select().eq(
          "id",
          enMsg.message_ref,
        );
        if (data && data[0].chat === chat.chatTable.id) {
          callBackOnPaUpdate(payload);
        }
      })();
    },
  );
  return [channel, channel2];
};

// TODO BuG FIX isTyping

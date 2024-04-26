import { getRemoteChatsFromChats } from "@src/store";
import { Database, Tables } from "@src/types/supabase";
import { createClient, User } from "@supabase/supabase-js";
import { toast } from "react-toastify";
import { useStore } from "@src/store";
import { dencryptMessage } from "./crypto";

export const downloadPhoto = async (user: User) => {
  const { data, error } = await supabase.storage
    .from("imageProfiles")
    .download(`${user.id}/${user.user_metadata.fileImageName}`);

  if (error) {
    toast.error(error.message);
    return;
  }
  return data;
};

export const downloadPhotoFromRef = async (ref: string) => {
  const { data, error } = await supabase.storage
    .from("imageProfiles")
    .download(ref);

  if (error) {
    toast.error(error.message);
    return;
  }
  return data;
};

export const selectPartecipantByUserId = async (id: string) => {
  const res = await supabase.from("partecipantsChatRoom").select().eq(
    "userId",
    id,
  );
  return res;
};

const supabase = createClient<Database>(
  "https://sgmvtnrndztzikdyaomm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnbXZ0bnJuZHp0emlrZHlhb21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU3MTUwMzYsImV4cCI6MjAxMTI5MTAzNn0.Ai9kQBuQ5C12yCmtxJMasAg3DNv-axV7qFI6D5RAdYA",
  {
    realtime: {
      timeout: 100000,
    },
  },
);

export const getContacts = async (
  userId: string,
) => {
  if (useStore.getState().getRemoteChatsCount === 1) return null;
  const chats = useStore.getState().chats;
  if (chats?.length && chats.length > 0) return null;
  if (!userId) return;
  const partecipant = await supabase
    .from("partecipantsChatRoom")
    .select()
    .eq("userId", userId);
  if (partecipant.error) {
    toast.error(partecipant.error.message);
    return null;
  }
  if (!partecipant.data[0]) return null;
  const partecipantChats = await supabase
    .from("partecipants_chats")
    .select()
    .eq("partecipant_id", partecipant.data![0].id);
  if (partecipantChats.error) {
    toast.error(partecipantChats.error.message);
    return null;
  }
  const chatsGet = [];
  for (let paChat of partecipantChats.data) {
    chatsGet.push(paChat.chat_id);
    chatsGet;
  }
  await getRemoteChatsFromChats(chatsGet, partecipant.data![0].id);
  return null;
};

export const retriveMsgs = async () => {
  const chats = useStore.getState().chats;
  const mePartecipant = useStore.getState().mePartecipant;

  if (!chats || !mePartecipant) return;
  for (let chat of chats) {
    const lastMsg = chat.messages?.at(-1);
    const QueryMsgs = supabase.from("messages").select().gt(
      "created_at",
      lastMsg?.messageTable.created_at,
    );
    const { data, error } = await QueryMsgs;
    if (!data || error) continue;
    for (let msg of data) {
      const encMsgsQ = await supabase.from("encrypted_messages").select().eq(
        "message_ref",
        msg.id,
      ).eq("recipient_id", mePartecipant!.id);
      if (encMsgsQ.error) break;
      const encMsgData = encMsgsQ.data[0];
      const isSentByMe = msg.by === mePartecipant?.id;
      const messageDecrypted = await dencryptMessage(
        mePartecipant!.private_key!,
        encMsgData.encrypted_message,
      );
      useStore.getState().addMessageToChat(
        chat.chatTable.id,
        {
          isSentByMe,
          messageDecrypted: messageDecrypted.data as string,
          messageEncrypted: encMsgData,
          messageTable: msg,
        },
      );
      useStore.getState().updateUnviewdMsgs(chat.chatTable.id, data.length);
    }
  }
};

export const addMessageCallBack = async (
  payload: Tables<"encrypted_messages">,
  chatId: string,
) => {
  const message = await supabase
    .from("messages")
    .select()
    .eq("id", payload.message_ref);

  const mePartecipant = useStore.getState().mePartecipant;
  const isSentByMe = message.data![0].by === mePartecipant?.id;
  const messageDecrypted = await dencryptMessage(
    mePartecipant!.private_key!,
    payload.encrypted_message,
  );
  useStore.getState().addMessageToChat(chatId, {
    isSentByMe,
    // @ts-ignore
    messageDecrypted: messageDecrypted.data,
    messageEncrypted: payload,
    messageTable: message.data![0] as unknown as Tables<"messages">,
  });
};

export default supabase;

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
// import { Database } from '@root/database.types'
import { Tables } from "@src/types/supabase";
import createSelectors from "./createselectors";
import supabase from "@src/utils/supabase";
import { User } from "@supabase/supabase-js";
import { dencryptMessage } from "@src/utils/crypto";
import { persist } from "zustand/middleware";

export interface Message {
  messageTable: Tables<"messages">;
  messageEncrypted: Tables<"encrypted_messages">;
  isSentByMe: boolean;
  messageDecrypted: string;
}

//type OtherPart = Omit<Tables<"partecipantsChatRoom">, "private_key">;
type ChatPartecipants = {
  partecipant: Tables<"partecipants_chats">;
  userPartecipant: {
    partecipant: Tables<"partecipantsChatRoom">;
    user: User;
  };
};
export interface Chat {
  chatTable: Tables<"chats">;
  messages?: Message[];
  partecipants: ChatPartecipants[];
  mePartecipant: Tables<"partecipants_chats">;
  unviewdMsgs: number;
}

interface State {
  chats?: Chat[];
  getRemoteChatsCount: number;
  mePartecipant?: Tables<"partecipantsChatRoom">;
}

type Actions = {
  addMePartecipant: (pa: Tables<"partecipantsChatRoom">) => void;
  addChat: (chat: Chat) => void;
  /*  general_other_update: (
    idChat: string,
    idOther: string,
    other: Partial<Tables<"partecipantsChatRoom">>,
  ) => void;*/
  chatAlredyExsistWithId: (otherId: string) => boolean | undefined;
  removeAllChats: () => void;
  updateChatUserMetadata: (
    metadata: User["user_metadata"],
    chatId: string,
  ) => void;
  getRemoteChatsFromChats: (chatIds: string[], meId: string) => Promise<void>;
  updateChatTable: (chatId: string, chatData: Tables<"chats">) => void;
  addMessageToChat: (chatId: string, msg: Message) => void;
  updatePartecipantsChat: (
    chatId: string,
    payload: {
      isTyping?: boolean;
      role?: "admin" | "base" | "viewer";
      hasLeaved?: boolean;
      isStarred?: boolean;
    },
    isMe?: boolean,
  ) => void;
  updateOnlineUser: (val: boolean, chatId: string, chatUserId: string) => void;
  updateUnviewdMsgs: (chatId: string, num: number) => void;
};

export const useStoreBase = create<State & Actions>()(
  persist(
    immer((set, _get, store) => ({
      chats: [],
      getRemoteChatsCount: 0,
      updateUnviewdMsgs: (chatId, num) =>
        set((state) => {
          const chats = store.getState().chats;
          const chatIdx = chats?.findIndex((ch) => ch.chatTable.id === chatId);
          if (!state.chats || (!chatIdx && chatIdx !== 0) || !chats) return;
          state.chats[chatIdx].unviewdMsgs = num;
        }),
      updateOnlineUser: (val, chatId, chatUserId) =>
        set((state) => {
          const chats = store.getState().chats;
          const chatIdx = chats?.findIndex((ch) => ch.chatTable.id === chatId);
          if (!state.chats || (!chatIdx && chatIdx !== 0) || !chats) return;
          const userIdx = chats[chatIdx].partecipants.findIndex((p) =>
            p.partecipant.partecipant_id === chatUserId
          );
          state.chats[chatIdx].partecipants[userIdx].userPartecipant.partecipant
            .isOnline = val;
        }),
      updatePartecipantsChat: (chatId, payload, isMe) =>
        set((state) => {
          const chatIdx = store.getState().chats?.findIndex((ch) =>
            ch.chatTable.id === chatId
          );
          if (!state.chats || (!chatIdx && chatIdx !== 0)) return;
          if (!isMe) {
            if (payload.isTyping === true || payload.isTyping === false) {
              state.chats[chatIdx].partecipants[0].partecipant.isTyping =
                payload.isTyping;
            }

            if (payload.role) {
              state.chats[chatIdx].partecipants[0].partecipant.role =
                payload.role;
            }
            if (payload.hasLeaved === true || payload.hasLeaved === false) {
              state.chats[chatIdx].partecipants[0].partecipant.hasLeaved =
                payload.hasLeaved;
            }

            if (payload.isStarred === true || payload.isStarred === false) {
              state.chats[chatIdx].partecipants[0].partecipant.isStarred =
                payload.isStarred;
            }
          } else {
            if (payload.isTyping === true || payload.isTyping === false) {
              state.chats[chatIdx].mePartecipant.isTyping = payload.isTyping;
            }

            if (payload.role) {
              state.chats[chatIdx].mePartecipant.role = payload.role;
            }
            if (payload.hasLeaved === true || payload.hasLeaved === false) {
              state.chats[chatIdx].mePartecipant.hasLeaved = payload.hasLeaved;
            }

            if (payload.isStarred === true || payload.isStarred === false) {
              state.chats[chatIdx].mePartecipant.isStarred = payload.isStarred;
            }
          }
        }),
      addMessageToChat: (chatId, msg) =>
        set((state) => {
          const chatIdx = store.getState().chats?.findIndex((ch) =>
            ch.chatTable.id === chatId
          );
          if (!state.chats || (!chatIdx && chatIdx !== 0)) return;
          if (!state.chats[chatIdx].messages) {
            state.chats[chatIdx].messages = [];
          }
          state.chats[chatIdx].messages!.push(msg);
        }),
      addMePartecipant: (pa) =>
        set((state) => {
          state.mePartecipant = pa;
        }),
      getRemoteChatsFromChats: async (chats, me) => {
        if (store.getState().getRemoteChatsCount >= 1) return;
        set((state) => {
          state.getRemoteChatsCount = ++state.getRemoteChatsCount;
        });
        for (let chatId of chats) {
          const chat = await supabase.from("chats").select().eq("id", chatId);
          if (chat.error || !chat.data) continue;
          const partecipantChats = await supabase.from("partecipants_chats")
            .select().eq("chat_id", chat.data![0].id);
          if (!partecipantChats.data || partecipantChats.error) continue;
          const mePa = partecipantChats.data.find((pa) =>
            pa.partecipant_id === me
          );
          if (!mePa) break;
          for (let paChat of partecipantChats.data) {
            if (paChat.partecipant_id === me) {
              continue;
            }
            const userPartecipant = await supabase.from("partecipantsChatRoom")
              .select().eq("id", paChat.partecipant_id);
            if (!userPartecipant.data || userPartecipant.error) continue;
            const user = await supabase.functions.invoke("get-user-by-id", {
              body: {
                id: userPartecipant.data[0].userId,
                secret: "tP<5044ixV!9RSfIPj>Go@ylqhKPHa",
              },
            });
            const messagesArr: Message[] = [];
            if (!user.data || user.error) continue;
            const messages = await supabase.from("messages").select().or(
              `by.eq.${userPartecipant.data[0].id},by.eq.${me}`,
            );
            if (messages.error) continue;
            for (let message of messages.data) {
              const encrypted_message = await supabase.from(
                "encrypted_messages",
              )
                .select().eq("message_ref", message.id).eq(
                  "recipient_id",
                  me,
                );
              const mePa = store.getState().mePartecipant;
              const isSentByMe = message.by === mePa?.id;
              if (
                encrypted_message?.data &&
                encrypted_message?.data[0]?.encrypted_message
              ) {
                const decryptedMsg = await dencryptMessage(
                  mePa!.private_key!,
                  encrypted_message.data[0].encrypted_message,
                );
                messagesArr.push({
                  isSentByMe,
                  // @ts-ignore
                  messageDecrypted: decryptedMsg.data,
                  messageTable: message,
                  messageEncrypted: encrypted_message.data![0],
                });
              }
            }
            store.getState().addChat({
              mePartecipant: mePa,
              chatTable: chat.data[0],
              messages: messagesArr,
              unviewdMsgs: 0,
              partecipants: [{
                partecipant: paChat,
                userPartecipant: {
                  user: user.data.data.user as User,
                  partecipant: userPartecipant.data[0],
                },
              }],
            });
          }
        }
      },
      chatAlredyExsistWithId: (otherId) => {
        const chats = store.getState().chats?.filter((ch) =>
          !Boolean(ch.chatTable.isGroup)
        );
        if (!chats) return;
        for (let chat of chats) {
          if (
            chat.partecipants.find((pa) =>
              pa.userPartecipant.partecipant.userId === otherId
            )
          ) return true;
        }
        return false;
      },
      updateChatUserMetadata: (metadata, chatId) =>
        set((state) => {
          const chatIdx = store.getState().chats?.findIndex((ch) =>
            ch.chatTable.id === chatId
          );
          if (!state.chats || (!chatIdx && chatIdx !== 0)) return;
          if (metadata.bio) {
            state.chats[chatIdx].partecipants[0].userPartecipant.user
              .user_metadata.bio = metadata.bio;
          }
          if (metadata.userName) {
            state.chats[chatIdx].partecipants[0].userPartecipant.user
              .user_metadata.userName = metadata.userName;
          }

          if (metadata.fileImageName) {
            state.chats[chatIdx].partecipants[0].userPartecipant.user
              .user_metadata.fileImageName = metadata.fileImageName;
          }
        }),
      removeAllChats: () =>
        set((state) => {
          state.chats = [];
          state.getRemoteChatsCount = 0;
        }),
      addChat: (chat) =>
        set((state) => {
          state.chats?.push(chat);
        }),

      updateChatTable: (id, chat) =>
        set((state) => {
          const chatIdx = store.getState().chats?.findIndex((ch) =>
            ch.chatTable.id === id
          );
          if (!state.chats || (!chatIdx && chatIdx !== 0)) return;
          state.chats[chatIdx].chatTable = chat;
        }),
    })),
    { name: "persist" },
  ),
);

export const getRemoteChatsFromChats =
  useStoreBase.getState().getRemoteChatsFromChats;

export const useStore = createSelectors(useStoreBase);

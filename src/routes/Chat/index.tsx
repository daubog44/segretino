import { Message, useStore } from "@src/store";
import supabase from "@src/utils/supabase";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoIosSend } from "react-icons/io";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { encryptMessage } from "@src/utils/crypto";
import ChatBubble from "./ChtBubble";
import { Tables } from "@src/types/supabase";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import ChatTyping from "./ChatTyping";
import { isElementInViewport } from "@src/utils/genericutils";

const Chat = function () {
  const { mePartecipant, chats } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageEl = useRef<HTMLDivElement>(null);
  let { pathname } = useLocation();
  const id = pathname.split("/").at(-1);
  const chat = chats?.find((ch) => ch.chatTable.id === id);
  const [_value, setValue] = useDebounce("", 500);
  const [messagesByDates, setMessagesByDates] = useState<{
    [key: string]: Message[];
  }>();
  if (!chat) throw new Error("user not find");
  const scroll = useCallback(() => {
    if (!lastMessageEl.current) return;
    if (isElementInViewport(lastMessageEl.current)) {
      messagesContainerRef.current?.scrollBy({
        behavior: "smooth",
        top: Number.MAX_SAFE_INTEGER,
      });
    }
  }, [lastMessageEl]);

  useEffect(() => {
    if (!messagesContainerRef) return;
    setTimeout(() => {
      messagesContainerRef.current?.scrollBy({
        behavior: "instant",
        top: Number.MAX_SAFE_INTEGER,
      });
    }, 20);
  }, [messagesContainerRef]);

  const debounced = useDebouncedCallback(
    // function
    (value) => {
      setValue(value);
      (async () => {
        await supabase
          .from("partecipants_chats")
          .update({ isTyping: debounced.isPending() })
          .eq("partecipant_id", mePartecipant!.id);
      })();
    },
    // delay in ms
    5000,
    { leading: true, trailing: true }
  );

  useEffect(() => {
    if (!chat.messages) return;
    setTimeout(scroll, 250);
    const obj = {} as { [key: string]: Message[] };
    const dates = [
      ...new Set(
        chat.messages?.map((ch) =>
          new Date(ch.messageTable.created_at).toLocaleDateString()
        )
      ),
    ];
    dates.forEach((date) => {
      obj[date] = chat.messages?.filter(
        (msg) =>
          new Date(msg.messageTable.created_at).toLocaleDateString() === date
      )!;
    });
    setMessagesByDates(obj);
  }, [chat.messages]);

  const hendleKey = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "Enter") {
      sendMessage();
    }
  };

  const sendMessage = async () => {
    const msg = inputRef.current?.value.trim();
    if (!mePartecipant || !msg) return;
    inputRef.current!.value = "";
    const message = await supabase
      .from("messages")
      .insert({ by: mePartecipant.id, chat: chat.chatTable.id })
      .select();
    if (message.error) {
      toast.error(message.error.message);
      return;
    }

    const encryptMessageForMe = await encryptMessage(
      mePartecipant.public_key!,
      msg
    );
    const encryptedMessageForMe = await supabase
      .from("encrypted_messages")
      .insert({
        // @ts-ignore
        encrypted_message: encryptMessageForMe,
        message_ref: message.data[0].id,
        recipient_id: mePartecipant.id,
      });

    if (encryptedMessageForMe.error) {
      toast.error(encryptedMessageForMe.error.message);
      return;
    }

    const encryptMessageForOther = await encryptMessage(
      chat.partecipants[0].userPartecipant.partecipant.public_key!,
      msg
    );

    const encryptedMessageForOther = await supabase
      .from("encrypted_messages")
      .insert({
        // @ts-ignore
        encrypted_message: encryptMessageForOther,
        message_ref: message.data[0].id,
        recipient_id: chat.partecipants[0].userPartecipant.partecipant.id,
      });

    if (encryptedMessageForOther.error) {
      toast.error(encryptedMessageForOther.error.message);
    }

    setTimeout(scroll, 100);
  };

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    debounced(ev.target.value);
  };
  useEffect(() => {
    const channel = supabase.channel(chat.chatTable.id + "-unviewd");

    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "encrypted_messages",
        filter: `recipient_id=eq.${chat.mePartecipant.partecipant_id}`,
      },
      (payload) => {
        const msg = payload.new as Tables<"encrypted_messages">;
        useStore.setState((state) => {
          if (state.chats === undefined) return;
          const { chats } = useStore.getState();
          const chatIdx = chats?.findIndex(
            (ch) => ch.chatTable.id === chat.chatTable.id
          );
          if (chatIdx === undefined || chats === undefined) return;
          const msgIdx = chats[chatIdx].messages?.findIndex(
            (ms) => ms.messageTable.id === msg.message_ref
          );
          if (
            msgIdx !== undefined &&
            state.chats[chatIdx].messages !== undefined
          )
            //@ts-ignore
            state.chats[chatIdx].messages[msgIdx].messageEncrypted.viewd = true;
        });
      }
    );
    channel.subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (chat.partecipants[0].partecipant.isTyping) scroll();
  }, [chat.partecipants[0].partecipant.isTyping]);

  return (
    <div className="h-[calc(100%-5rem)] w-full bg-cover bg-[url('/src/assets/background.jpg')]">
      <div className="h-full px-32 pb-11">
        <div
          className="overflow-y-scroll overflow-x-clip w-full h-[calc(100vh-13rem)]"
          ref={messagesContainerRef}
        >
          {messagesByDates &&
            Object.entries(messagesByDates).map((val, i, arr) => {
              return (
                <div key={val[0] + i}>
                  <div className="divider divider-info">{val[0]}</div>
                  {val[1].map((message, idx) => (
                    <div key={message.messageTable.id + idx}>
                      {i === arr.length - 1 && idx === val[1].length - 1 ? (
                        <div ref={lastMessageEl}>
                          <ChatBubble
                            isSentByMe={message.isSentByMe}
                            message={message.messageDecrypted}
                            seen={
                              message.isSentByMe &&
                              message.messageEncrypted.viewd
                            }
                            sentAt={new Date(message.messageTable.created_at)}
                            updatedAt={
                              message.messageTable.updatedAt
                                ? new Date(message.messageTable.updatedAt)
                                : undefined
                            }
                          />
                        </div>
                      ) : (
                        <div>
                          <ChatBubble
                            isSentByMe={message.isSentByMe}
                            message={message.messageDecrypted}
                            seen={message.messageEncrypted.viewd}
                            sentAt={new Date(message.messageTable.created_at)}
                            updatedAt={
                              message.messageTable.updatedAt
                                ? new Date(message.messageTable.updatedAt)
                                : undefined
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {chat.partecipants[0].partecipant.isTyping && (
                    <div>
                      <ChatTyping />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
        <div className="join mt-4 h-16 bg-base-300 rounded-full flex justify-between items-center">
          <div className="join-item">TYPE</div>
          <input
            ref={inputRef}
            type="text"
            onChange={(ev) => onChange(ev)}
            onKeyDown={(ev) => hendleKey(ev)}
            placeholder="Type here"
            className="input w-full join-item"
          />
          <button
            className="btn h-full w-16 rounded-r-full"
            onClick={sendMessage}
          >
            <IoIosSend className="h-full w-10 join-item" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

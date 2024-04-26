import { Await, Outlet, useLoaderData } from "react-router-dom";
import User from "@src/components/Avatar";
import AddChatBtn from "@src/components/SideBarBtn/addChatBtn";
import { useStore } from "@src/store";
import ChatBtn from "@src/components/SideBarBtn/ChatBtn";
import { Suspense, useCallback, useEffect } from "react";
import supabase from "@src/utils/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { toast } from "react-toastify";
import { appWindow } from "@tauri-apps/api/window";
import { UnlistenFn } from "@tauri-apps/api/event";
import { Tables } from "@src/types/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import HomeBtn from "@src/components/SideBarBtn/Home";
import useSubscribeToMessages from "@src/hooks/useSubscribeTomessages";

const HomePageLayout = function () {
  const data = useLoaderData();
  useSubscribeToMessages();
  const { chats, updateChatTable, mePartecipant, addChat, updateOnlineUser } =
    useStore();
  const { user } = Auth.useUser();
  if (!user) return;

  const updateUserToOflline = useCallback(async () => {
    if (!user || !chats?.length) return;
    const updateOp = await supabase
      .from("partecipantsChatRoom")
      .update({
        isOnline: false,
        online_at: new Date(Date.now()).toUTCString(),
      })
      .eq("userId", user.id);
    if (updateOp.error) {
      toast.error(updateOp.error.message);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let unlisten: UnlistenFn;
    (async () => {
      await supabase
        .from("partecipantsChatRoom")
        .update({ isOnline: true })
        .eq("userId", user.id);

      unlisten = await appWindow.onCloseRequested(async (event) => {
        event.preventDefault();
        await updateUserToOflline();
        await appWindow.close();
      });
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, [user]);

  useEffect(() => {
    let subscribes: RealtimeChannel[] = [];
    if (chats)
      for (let chat of chats) {
        if (chat.messages) {
          const unviewdMsgs = chat.messages.filter(
            (msg) => !msg.messageEncrypted.viewd && !msg.isSentByMe
          );
          useStore
            .getState()
            .updateUnviewdMsgs(chat.chatTable.id, unviewdMsgs.length);
        }
        const changes = supabase
          .channel("chat-updates" + user.id)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "partecipantsChatRoom",
              filter:
                "id=eq." + chat.partecipants[0].userPartecipant.partecipant.id,
            },
            (payload) => {
              updateOnlineUser(
                (payload.new as Tables<"partecipantsChatRoom">).isOnline!,
                chat.chatTable.id,
                chat.partecipants[0].userPartecipant.partecipant.id
              );
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "chats",
              filter: "id=eq." + chat.chatTable.id,
            },
            (payload) => {
              updateChatTable(
                chat.chatTable.id,
                payload.new as Tables<"chats">
              );
            }
          )
          .subscribe();

        subscribes.push(changes);
      }

    return () => {
      for (let change of subscribes) {
        change.unsubscribe();
      }
    };
  }, [chats]);

  useEffect(() => {
    if (!mePartecipant) return;
    const changes = supabase
      .channel("add-chat-on-create" + user.id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "partecipants_chats",
          filter: "partecipant_id=eq." + mePartecipant.id,
        },
        (payload) => {
          (async () => {
            const partecipants_chat =
              payload.new as Tables<"partecipants_chats">;
            if (
              chats?.find((ch) => ch.chatTable.id === partecipants_chat.chat_id)
            )
              return;
            const chat = await supabase
              .from("chats")
              .select()
              .eq("id", partecipants_chat.chat_id);
            if (chat.error) {
              return;
            }
            if (!chat.data[0].isGroup) {
              const other_partecipants_chat = await supabase
                .from("partecipants_chats")
                .select()
                .eq("chat_id", chat.data[0].id);
              if (other_partecipants_chat.error) return;
              const other = other_partecipants_chat.data.filter(
                (ch) => ch.partecipant_id !== mePartecipant.id
              );
              const otherPa = await supabase
                .from("partecipantsChatRoom")
                .select()
                .eq("id ", other[0].partecipant_id);
              if (otherPa.error) return;
              const id_user = otherPa.data[0].userId;
              const other_user = await supabase.functions.invoke(
                "get-user-by-id",
                {
                  body: {
                    id: id_user,
                    secret: "tP<5044ixV!9RSfIPj>Go@ylqhKPHa",
                  },
                }
              );
              addChat({
                mePartecipant: payload.new as Tables<"partecipants_chats">,
                chatTable: chat.data[0],
                unviewdMsgs: 0,
                partecipants: [
                  {
                    partecipant: other[0],
                    userPartecipant: {
                      user: other_user.data.data.user,
                      partecipant: otherPa.data[0],
                    },
                  },
                ],
              });
            }
          })();
        }
      )
      .subscribe();

    return () => {
      changes.unsubscribe();
    };
  }, []);

  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex flex-col justify-center items-center">
          <span className="loading loading-dots loading-lg"></span>
          <span className="">
            If this is your first time logging in, it may take some time
          </span>
        </div>
      }
    >
      <Await resolve={(data as any).promise}>
        <div className="h-full grid grid-rows-none grid-cols-[auto_calc(100%-4rem)]">
          <div className="w-16 h-full bg-base-100 p-1 pt-4 rounded-tr-md rounded-br-md col-auto">
            <div className="flex flex-col w-full">
              <div>
                <User />
              </div>
              <div className="divider"></div>
              <div className="grid h-20 card rounded-box place-items-center">
                <HomeBtn />
                <div className="h-4"></div>
                {chats
                  ?.filter((ch) => ch.mePartecipant.isStarred)
                  .map((chat) => (
                    <div key={chat.chatTable.id}>
                      <ChatBtn chatId={chat.chatTable.id} />
                      <div className="h-4"></div>
                    </div>
                  ))}
                <AddChatBtn />
              </div>
            </div>
          </div>
          <div className="relative col-auto h-full w-full">
            <Outlet />
          </div>
        </div>
      </Await>
    </Suspense>
  );
};

export default HomePageLayout;

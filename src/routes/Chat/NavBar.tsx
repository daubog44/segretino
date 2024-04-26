import { useStore } from "@src/store";
import { Link, Outlet, useLocation } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import Avatar from "@src/components/Avatar/Avatar";
import { Auth } from "@supabase/auth-ui-react";
import supabase from "@src/utils/supabase";
import { useEffect } from "react";

const NavBar = function () {
  let { pathname } = useLocation();
  const { chats } = useStore();
  const id = pathname.split("/").at(-1);
  const { user } = Auth.useUser();
  const chat = chats?.find((ch) => ch.chatTable.id === id);
  if (!chat) return;
  if (!user) return;

  useEffect(() => {
    if (chat.messages) {
      const notViewdMessages = chat.messages.filter(
        (chat) => !chat.messageEncrypted.viewd && !chat.isSentByMe
      );
      for (let message of notViewdMessages) {
        (async () => {
          const res = await supabase
            .from("encrypted_messages")
            .update({ viewd: true })
            .eq("message_ref", message.messageTable.id)
            .eq(
              "recipient_id",
              chat.partecipants[0].userPartecipant.partecipant.id
            )
            .select();
          if (res.error) return;
          //updateSeenMessage(chat.chatTable.id, res.data[0].id);
        })();
      }
    }
  }, [chat.messages]);

  return (
    <>
      <div className="h-20">
        <div className="navbar bg-base-300">
          <div className="navbar-start items-center">
            <Link to={"/home/" + user.id} className="mr-4 cursor-pointer">
              <IoMdArrowRoundBack className="h-14 w-14" />
            </Link>
            <div className="h-14 rounded btn btn-ghost w-14 p-0">
              <Avatar user={chat.partecipants[0].userPartecipant.user} />
            </div>
          </div>
          <div className="navbar-center">
            <div>
              {chat.partecipants[0].userPartecipant.user.user_metadata.userName}
            </div>
          </div>
          <div className="navbar-end">
            <button className="btn btn-ghost btn-circle">btn</button>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default NavBar;

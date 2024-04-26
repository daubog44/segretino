import supabase, { selectPartecipantByUserId } from "@src/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useRef, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import { IoSearchSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { CiUser } from "react-icons/ci";
import { Auth } from "@supabase/auth-ui-react";
import { useStore } from "@src/store";

const AddChatBtn = function () {
  const ref = useRef<null | HTMLDialogElement>(null);
  const inputEl = useRef<null | HTMLInputElement>(null);
  const [userSearched, setUserSearched] = useState<null | User>(null);
  const [loading, setLoading] = useState(false);
  const { chatAlredyExsistWithId } = useStore();
  const { user } = Auth.useUser();

  const addChatCl = async () => {
    if (!userSearched) return;
    setUserSearched(null);
    ref.current?.close();
    if (chatAlredyExsistWithId(userSearched.id)) {
      toast.warn("chat alredy exsist!");
      return;
    }
    const chat = supabase.from("chats").insert({}).select();

    const { data, error } = await chat;

    if (error) {
      toast.error(error.message);
      return;
    }
    const record = data[0];

    const partecipantMe = await selectPartecipantByUserId(user!.id);
    if (partecipantMe.error) {
      toast.error(partecipantMe.error.message);
      return;
    }
    const partecipantOther = await selectPartecipantByUserId(userSearched.id);
    if (partecipantOther.error) {
      toast.error(partecipantOther.error.message);
      return;
    }
    const createRelation1 = await supabase
      .from("partecipants_chats")
      .insert({
        chat_id: record.id,
        partecipant_id: partecipantOther.data[0].id,
      })
      .select();
    if (createRelation1.error) {
      toast.error(createRelation1.error?.message);
      return;
    }
    const createRelation2 = await supabase
      .from("partecipants_chats")
      .insert({
        chat_id: record.id,
        partecipant_id: partecipantMe.data[0].id,
      })
      .select();
    if (createRelation2.error) {
      toast.error(createRelation2.error?.message);
      return;
    }
    toast.success("Chat added!");
  };

  const searchUser = async () => {
    if (
      !inputEl.current ||
      inputEl.current.value === user?.user_metadata.userName
    ) {
      toast.warn("You can't add this chat.");
      return;
    }
    setLoading(true);
    const username = inputEl.current?.value;
    const userSearch = await supabase.functions.invoke("get-user", {
      body: {
        secret: "tP<5044ixV!9RSfIPj>Go@ylqhKPHa",
        q: username,
      },
    });

    if (userSearch?.error) {
      toast.error("user not find!");
      setLoading(false);
      setUserSearched(null);
      return;
    }

    const userData = userSearch?.data as User;
    setLoading(false);
    setUserSearched(userData);
  };

  const hendleKey = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "Enter") {
      searchUser();
    }
  };
  return (
    <>
      <button
        className="btn btn-square btn-outline"
        onClick={() => ref?.current && ref.current.showModal()}
      >
        <IoIosAdd className="h-8 w-8" />
      </button>
      <dialog ref={ref} id="my_modal_2" className="modal">
        <div className="modal-box">
          <div className="join w-full">
            <input
              ref={inputEl}
              onKeyDown={hendleKey}
              className="input input-bordered join-item input-primary w-full"
              placeholder="user name"
            />
            <button
              onClick={searchUser}
              className="btn btn-secondary join-item rounded-r-full"
            >
              <IoSearchSharp />
            </button>
          </div>
          <div className="mt-5 flex justify-center">
            {loading ? (
              <span className="loading loading-bars loading-lg"></span>
            ) : userSearched === null ? (
              <div>search user</div>
            ) : (
              <div className="card card-side bg-base-100 shadow-xl">
                {userSearched.user_metadata.fileImageName ? (
                  <figure>
                    <img
                      className=" rounded-full"
                      src={
                        supabase.storage
                          .from("imageProfiles")
                          .getPublicUrl(
                            `${userSearched.id}/${userSearched.user_metadata.fileImageName}`
                          ).data.publicUrl
                      }
                      alt={userSearched?.email?.at(0)?.toUpperCase() || "A"}
                    />
                  </figure>
                ) : (
                  <div className="w-28 h-full pr-2">
                    <CiUser className="w-full h-full" />
                  </div>
                )}
                <div className="card-body">
                  <h2 className="card-title">
                    {userSearched.user_metadata?.userName}
                  </h2>
                  <p>{userSearched.user_metadata?.bio}</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary" onClick={addChatCl}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default AddChatBtn;

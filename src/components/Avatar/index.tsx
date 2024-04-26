import { Auth } from "@supabase/auth-ui-react";
import Avatar from "./Avatar";
import { User } from "@supabase/supabase-js";
import { CiLogout } from "react-icons/ci";
import supabase from "@src/utils/supabase";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { useStore } from "@src/store";

const AvatarLayout = function () {
  const navigate = useNavigate();
  const { user } = Auth.useUser();
  const { removeAllChats } = useStore();

  const onLogoutClick = useCallback(async () => {
    if (user)
      await supabase
        .from("partecipantsChatRoom")
        .update({
          isOnline: false,
          online_at: new Date(Date.now()).toUTCString(),
        })
        .eq("userId", user.id);
    removeAllChats();
    await supabase.auth.signOut();
    navigate("/login");
  }, []);

  return (
    <div className="dropdown dropdown-right dropdown-hover w-full">
      <div
        tabIndex={0}
        role="button"
        className="h-14 rounded btn btn-ghost w-full p-0"
      >
        <Avatar user={user as User} />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[100] menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li>
          <Link
            to={"/home/" + user!.id + "/profile"}
            className="inline-flex justify-center"
          >
            PROFILE <CgProfile />
          </Link>
        </li>
        <li>
          <a className="inline-flex justify-center" onClick={onLogoutClick}>
            LOGOUT <CiLogout />
          </a>
        </li>
      </ul>
    </div>
  );
};

export default AvatarLayout;

/*
<details className="dropdown dropdown-right dropdown-hover w-full">
      <summary tabIndex={0} className="h-14 rounded btn btn-ghost w-full p-0">
        <Avatar user={user as User} supabase={supabase as SupabaseClient} />
      </summary>
      <ul
        tabIndex={0}
        className="p-2 shadow menu dropdown-content z-[1] bg-base-300 rounded-box w-52 border border-base-content"
      >
        <li>
          <Link to="/home/profile" className="inline-flex justify-center">
            PROFILE <CgProfile />
          </Link>
        </li>
        <li>
          <a className="inline-flex justify-center" onClick={onLogoutClick}>
            LOGOUT <CiLogout />
          </a>
        </li>
      </ul>
    </details>
*/

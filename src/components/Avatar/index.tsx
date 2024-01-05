import { Auth } from "@supabase/auth-ui-react";
import Avatar from "./Avatar";
import { User } from "@supabase/supabase-js";
import { CiLogout } from "react-icons/ci";
import { useStore } from "../../store";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";

const AvatarLayout = function () {
  const { supabase } = useStore();
  const navigate = useNavigate();
  const { user } = Auth.useUser();

  const onLogoutClick = useCallback(async () => {
    await supabase?.auth.signOut();
    navigate("/");
  }, []);

  return (
    <details className="dropdown dropdown-hover w-full">
      <summary tabIndex={0} className="h-14 rounded btn btn-ghost w-full p-0">
        <Avatar user={user as User} />
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
  );
};

export default AvatarLayout;

import { Auth } from "@supabase/auth-ui-react";
import { Link } from "react-router-dom";

const HomeBtn = function () {
  const { user } = Auth.useUser();

  return (
    <Link to={"/home/" + user!.id}>
      <button className="px-4 btn btn-square btn-outline">HOME</button>
    </Link>
  );
};

export default HomeBtn;

import { Outlet, useNavigate } from "react-router-dom";
import supabase from "@src/utils/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { useEffect } from "react";
// import { NextUIProvider } from "@nextui-org/react";

function Root() {
  const { user } = Auth.useUser();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!user) navigate("/login");
    })();
  }, [user]);

  return (
    <>
      <main
        className={`text-base-content bg-base-200 h-[calc(100vh)] w-full`}
        data-theme="dracula"
      >
        <Auth.UserContextProvider supabaseClient={supabase}>
          <Outlet />
        </Auth.UserContextProvider>
      </main>
    </>
  );
}

export default Root;

import { Outlet } from "react-router-dom";
import { useStore } from "../store";
import { Auth } from "@supabase/auth-ui-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { ToastContainer } from "react-toastify";
// import { NextUIProvider } from "@nextui-org/react";

function Root() {
  const { supabase } = useStore();
  return (
    <>
      <main
        className={`text-base-content bg-base-200 h-[calc(100vh)] w-full pt-7`}
        data-theme="dracula"
      >
        <Auth.UserContextProvider supabaseClient={supabase as SupabaseClient}>
          <Outlet />
        </Auth.UserContextProvider>
      </main>
    </>
  );
}

export default Root;

import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { useNavigate } from "react-router-dom";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  // Import predefined theme
  ThemeSupa,
} from "@supabase/auth-ui-shared";
import { useStore } from "@src/store";
import ShortUniqueId from "short-unique-id";

export default function LoginPage() {
  const { supabase } = useStore();
  const [uid, _] = useState(new ShortUniqueId({ length: 10 }));
  const { user } = Auth.useUser();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (user) {
        console.log(user);
        if (!user.user_metadata.userName) {
          await supabase?.auth.updateUser({
            data: {
              userName: `${user.email?.split("@")[0]}${uid.rnd()}`,
              bio: "",
            },
          });
        }
        return navigate("/home");
      }
    })();
  }, [user]);

  return (
    <div className="flex items-center justify-center p-48 h-full">
      <Auth
        supabaseClient={supabase as SupabaseClient}
        appearance={{ theme: ThemeSupa }}
        providers={["google"]}
        theme="dark"
      />
    </div>
  );
}

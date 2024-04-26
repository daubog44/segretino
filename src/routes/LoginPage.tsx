import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  // Import predefined theme
  ThemeSupa,
} from "@supabase/auth-ui-shared";
import supabase from "@src/utils/supabase";
import ShortUniqueId from "short-unique-id";
import { Auth } from "@supabase/auth-ui-react";
import { useStore } from "@src/store";

export default function LoginPage() {
  const [uid, _] = useState(new ShortUniqueId({ length: 10 }));
  const { user } = Auth.useUser();
  const { addMePartecipant } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (user) {
        if (!user.user_metadata.userName) {
          await supabase.auth.updateUser({
            data: {
              userName: `${user.email?.split("@")[0]}${uid.rnd()}`,
              bio: "I am a new user!",
            },
          });

          const partecipant = await supabase
            .from("partecipantsChatRoom")
            .insert({ userId: user!.id, isOnline: true })
            .select();
          if (partecipant.data) {
            addMePartecipant(partecipant.data[0]);
          }
        }
        setTimeout(async () => {
          const partecipant = await supabase
            .from("partecipantsChatRoom")
            .select()
            .eq("userId", user.id);
          if (partecipant.data) {
            addMePartecipant(partecipant.data[0]);
          }
        }, 100);
        return navigate("/home/" + user.id);
      }
    })();
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center p-48 h-full">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        theme="dark"
        redirectTo="https://segretino-web-project.vercel.app/auth/success-register"
      />
    </div>
  );
}

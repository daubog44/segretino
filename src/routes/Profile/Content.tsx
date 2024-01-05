import Avatar from "../../components/Avatar/Avatar";
import { Auth } from "@supabase/auth-ui-react";
import { User } from "@supabase/supabase-js";
import { useCallback, useRef, useState } from "react";
import { useStore } from "../../store";
import { toast } from "react-toastify";

function ContentProfilePage() {
  const { user } = Auth.useUser();
  const { supabase } = useStore();
  const [file, setFile] = useState<File | null | undefined>(null);
  const bioRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.item(0);
    setFile(file);
  };

  const updateUser = useCallback(async () => {
    try {
      if (file) {
        await supabase?.storage
          .from("imageProfiles")
          .upload(`${user?.user_metadata.userName}/${file.name}`, file, {
            upsert: true,
            cacheControl: `${3600 * 10}`,
          });
      }
    } catch (e) {
      console.log(e);
      toast.error("update image profile failed");
    }

    try {
      await supabase?.auth.updateUser({
        data: {
          bio: bioRef.current?.value,
        },
      });
      toast.success("update sucess!");
    } catch (e) {
      console.log(e);
      toast.error("update bio failed");
    }
  }, [bioRef, file]);

  return (
    <div className="flex flex-col items-center">
      <Avatar user={user as User} />
      <div className="mt-4 flex flex-col gap-4">
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text block text-gray-700 font-bold">
              Image profile
            </span>
          </div>
          <input
            onChange={handleFileSelected}
            type="file"
            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
          />
        </label>

        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text block text-gray-700 font-bold">
              Bio
            </span>
          </div>
          <input
            ref={bioRef}
            id="bio"
            type="text"
            placeholder={`${
              user?.user_metadata.bio ? user.user_metadata.bio : "Type here"
            }`}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </label>
      </div>
      <button className="btn btn-primary mt-8" onClick={updateUser}>
        Save
      </button>
    </div>
  );
}

export default ContentProfilePage;

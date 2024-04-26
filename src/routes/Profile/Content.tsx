import Avatar from "@src/components/Avatar/Avatar";
import { Auth } from "@supabase/auth-ui-react";
import { User } from "@supabase/supabase-js";
import { useRef, useState } from "react";
import supabase from "@src/utils/supabase";
import { toast } from "react-toastify";
import { MdContentCopy } from "react-icons/md";
import validator from "validator";

function ContentProfilePage() {
  const { user } = Auth.useUser();
  const [file, setFile] = useState<File | null | undefined>(null);
  const bioRef = useRef<HTMLInputElement>(null);
  const userNameRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.item(0);
    setFile(file);
  };

  const updateUserName = async () => {
    if (
      user?.user_metadata.userName !== userNameRef.current?.value &&
      userNameRef.current?.value
    ) {
      if (
        !(
          validator.isAlphanumeric(userNameRef.current?.value) &&
          validator.isLength(userNameRef.current?.value, { max: 20, min: 6 })
        )
      ) {
        throw new Error(
          "invalid username: string must be alphanumeric and 6 min lenght!"
        );
      }

      const userAlredyExsist = await supabase.functions.invoke("get-user", {
        body: {
          secret: "tP<5044ixV!9RSfIPj>Go@ylqhKPHa",
          q: userNameRef.current?.value,
        },
      });

      // if user exists than throw error
      if ((userAlredyExsist?.data as User)?.id && !userAlredyExsist?.error) {
        throw new Error("username is not avaible");
      }

      const res = await supabase.auth.updateUser({
        data: {
          userName: `${userNameRef.current?.value}`,
        },
      });

      if (res?.error) {
        throw res.error;
      }
      return true;
    }
    return false;
  };

  const updateUserImage = async () => {
    if (file) {
      if (user?.user_metadata.fileImageName)
        await supabase.storage
          .from("imageProfiles")
          .remove([`${user?.id}/${user?.user_metadata.fileImageName}`]);

      const res = await supabase.storage
        .from("imageProfiles")
        .upload(`${user?.id}/${file.name}`, file, {
          upsert: true,
          cacheControl: `${3600 * 10}`,
        });

      const res2 = await supabase.auth.updateUser({
        data: {
          fileImageName: file.name,
        },
      });
      if (res2?.error || res?.error) {
        throw new Error("update image profile failed");
      }
      return true;
    }
    return false;
  };

  const updateUserBio = async () => {
    if (
      bioRef.current?.value !== user?.user_metadata.bio &&
      bioRef.current?.value
    ) {
      const res3 = await supabase.auth.updateUser({
        data: {
          bio: bioRef.current?.value,
        },
      });

      if (res3?.error) {
        throw new Error("update bio failed");
      }
      return true;
    }
    return false;
  };

  const updateUser = async () => {
    try {
      const res = await Promise.all([
        updateUserImage(),
        updateUserName(),
        updateUserBio(),
      ]);
      if (res.every((v) => v === false)) {
        toast.info("Nothing to change!");
        return;
      }
      toast.success("update sucess!");
    } catch (e) {
      toast.error((e as Error).message);
      return;
    }
  };

  const copyToClipboard = () => {
    if (userNameRef?.current?.value) {
      navigator.clipboard.writeText(userNameRef.current.value);
      toast.success("copied!");
    } else if (user?.user_metadata.userName) {
      navigator.clipboard.writeText(user?.user_metadata.userName);
      toast.success("copied!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-1/3">
        <Avatar
          imageSrc={file ? URL.createObjectURL(file) : undefined}
          user={user as User}
        />
      </div>
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
            accept="image/*"
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

        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text block text-gray-700 font-bold">
              Username
            </span>
          </div>
          <div className="join">
            <input
              ref={userNameRef}
              id="username"
              type="text"
              placeholder={`${user?.user_metadata.userName}`}
              className="join-item input input-bordered input-primary w-[calc(100%-3rem)]"
            />
            <button
              className="join-item btn btn-primary w-12"
              onClick={copyToClipboard}
            >
              <MdContentCopy />
            </button>
          </div>
        </label>
      </div>
      <button className="btn btn-primary mt-8" onClick={updateUser}>
        Save
      </button>
    </div>
  );
}

export default ContentProfilePage;

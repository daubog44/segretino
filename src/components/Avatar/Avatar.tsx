import { downloadPhoto } from "@src/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";
const Avatar = function ({
  user,
  imageSrc,
  isOnline,
  unviewdMsgs,
}: {
  imageSrc?: string;
  isOnline?: boolean;
  unviewdMsgs?: number;
  user: User;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;
    if (imageSrc) {
      imgRef.current.src = imageSrc;
      return;
    }
    if (user?.user_metadata.fileImageName) {
      const asyncFn = async () => {
        const imageData = await downloadPhoto(user);
        if (!imageData || !imgRef.current) return;
        const srcImage = URL.createObjectURL(imageData);
        imgRef.current.src = srcImage;
      };

      asyncFn();
    }
  }, [user, imgRef, imageSrc]);
  if (imgRef.current || imageSrc || user?.user_metadata?.fileImageName)
    return (
      <div className="avatar indicator w-fit h-full">
        {isOnline && (
          <span
            className={`indicator-item  indicator-start badge badge-primary`}
          >
            {unviewdMsgs || ""}
          </span>
        )}
        <img className="rounded-full object-cover" ref={imgRef} />
      </div>
    );
  return (
    <div className="indicator flex justify-center w-full rounded-full text-center text-2xl z-10">
      {isOnline && (
        <span className={`indicator-item indicator-start badge badge-primary`}>
          {unviewdMsgs || ""}
        </span>
      )}
      <span>{(user as User)?.email?.at(0)?.toUpperCase() || "A"}</span>
    </div>
  );
};

export default Avatar;

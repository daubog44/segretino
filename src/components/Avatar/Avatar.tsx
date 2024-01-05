import { User } from "@supabase/supabase-js";

const Avatar = function ({ user }: { user: User }) {
  if (
    !user?.identities?.find((i) => Boolean(i.identity_data?.avatar_url))
      ?.identity_data?.avatar_url
  )
    return (
      <>
        <div className="w-full rounded-full text-xl z-10">
          {(user as User).email?.at(0)?.toUpperCase()}
        </div>
      </>
    );

  return (
    <>
      <div className="avatar z-10">
        <div className="w-full rounded-full">
          <img
            src={
              user?.identities?.find((i) =>
                Boolean(i.identity_data?.avatar_url)
              )?.identity_data?.avatar_url
            }
          />
        </div>
      </div>
    </>
  );
};

export default Avatar;

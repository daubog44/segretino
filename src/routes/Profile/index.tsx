import withTransitionAnimation from "@src/HOCS/withTransitionAnimation";
import ContentProfilePage from "./Content";

const Profile = function () {
  return (
    <section className={`h-full`}>
      <div className="flex justify-center items-center h-full">
        <ContentProfilePage />
      </div>
    </section>
  );
};

export default withTransitionAnimation(Profile);

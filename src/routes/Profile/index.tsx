import { GoArrowLeft } from "react-icons/go";
import { Link } from "react-router-dom";
import withTransitionAnimation from "@src/HOCS/withTransitionAnimation";
import ContentProfilePage from "./Content";

const Profile = function () {
  return (
    <section className={`h-full`}>
      <Link
        to="/home"
        className="absolute m-4 hover:bg-primary-content cursor-pointer rounded-full p-4"
      >
        <GoArrowLeft size={30} />
      </Link>
      <div className="flex justify-center items-center h-full">
        <ContentProfilePage />
      </div>
    </section>
  );
};

export default withTransitionAnimation(Profile);

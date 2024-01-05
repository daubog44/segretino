import { Outlet } from "react-router-dom";
import User from "../../components/Avatar";
import withTransitionAnimation from "../../HOCS/withTransitionAnimation";
import { ToastContainer } from "react-toastify";

const HomePageLayout = function () {
  return (
    <div className="h-full grid grid-rows-none grid-cols-[auto_calc(100%-4rem)]">
      <div className="w-16 h-full bg-base-100 p-1 pt-4 rounded-tr-md rounded-br-md col-auto">
        <div className="flex flex-col w-full">
          <div>
            <User />
          </div>
          <div className="divider"></div>
          <div className="grid h-20 card rounded-box place-items-center">
            content
          </div>
        </div>
      </div>
      <div className="relative col-auto h-full w-full">
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Outlet />
      </div>
    </div>
  );
};

export default HomePageLayout;

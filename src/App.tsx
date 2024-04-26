import { RouterProvider, createBrowserRouter, defer } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ErrorPage from "./routes/ErrorPage";
import LoginPage from "./routes/LoginPage";
import Profile from "./routes/Profile";
import Root from "./routes/Root";
import Home from "./routes/HomePage";
import { getContacts, retriveMsgs } from "./utils/supabase";
import NavBar from "./routes/Chat/NavBar";
import Chats from "./routes/Chats";
import Chat from "./routes/Chat";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/home/:userId",
        element: <Home />,
        loader: async ({ params }) => {
          const promise = Promise.all([
            getContacts(params.userId!),
            retriveMsgs(),
          ]);
          return defer({ promise });
        },
        children: [
          {
            index: true,
            element: <Chats />,
          },
          {
            path: "/home/:userId/profile",

            element: <Profile />,
          },
          {
            path: "/home/:userId/:chatId",
            element: <NavBar />,
            children: [{ index: true, element: <Chat /> }],
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <>
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
      <RouterProvider router={router} />
    </>
  );
}

export default App;

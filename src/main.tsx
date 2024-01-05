import React, { useCallback, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  RouterProvider,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import ErrorPage from "./routes/ErrorPage";
import LoginPage from "./routes/LoginPage";
import Root from "./routes/Root";
import Home from "./routes/HomePage";
import { loader } from "./routes/rootLoader";
import "./styles.css";
import TitleBar from "./components/TitleBar";
import { invoke } from "@tauri-apps/api";
import { themeChange } from "theme-change";
import { getAll } from "@tauri-apps/api/window";
import Profile from "./routes/Profile";
import Chats from "./routes/Chats";
import * as Sentry from "@sentry/react";
import "react-toastify/dist/ReactToastify.css";

const sentryCreateBrowserRouter =
  Sentry.wrapCreateBrowserRouter(createBrowserRouter);

const router = sentryCreateBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    loader,
    children: [
      {
        index: true,
        element: <LoginPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/home",
        element: <Home />,
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <Chats />,
            errorElement: <ErrorPage />,
          },
          {
            path: "/home/profile",
            element: <Profile />,
            errorElement: <ErrorPage />,
          },
        ],
      },
    ],
  },
]);

export const App = function () {
  const close_splashscreen = useCallback(async () => {
    const splashscreen = getAll().find((e) => e.label === "splashscreen");
    try {
      const isVisible = await splashscreen?.isClosable();
      if (isVisible) {
        await invoke("close_splashscreen");
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    themeChange(false);
    close_splashscreen();
  }, []);

  return (
    <>
      <TitleBar />
      <RouterProvider router={router} />
    </>
  );
};

Sentry.init({
  dsn: "https://8f3ba2c96334752b095dc51498159e75@o4506520379785216.ingest.sentry.io/4506520423497728",
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],

      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: process.env.DEVELOPMENT ? 1.0 : 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

ReactDOM.createRoot(
  (document.getElementById("root") as HTMLElement) ||
    document.createElement("div")
).render(
  <>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </>
);

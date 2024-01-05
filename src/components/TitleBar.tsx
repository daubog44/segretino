import { appWindow } from "@tauri-apps/api/window";
import { useLayoutEffect, useRef, useState } from "react";
import {
  VscChromeMaximize,
  VscChromeClose,
  VscChromeMinimize,
  VscChromeRestore,
} from "react-icons/vsc";
import logo from "../../src-tauri/icons/32x32.png";

const TitleBar = function () {
  const [changeIcon, setChangeIcon] = useState(true);
  const minimizeBtn = useRef<HTMLDivElement>(null);
  const maximizeBtn = useRef<HTMLDivElement>(null);
  const titleBarClose = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const titlebarMinimizeHandler = async () => {
      await appWindow.minimize();
    };
    const titlebarMaximizeHandler = async () => {
      await appWindow.toggleMaximize();
    };
    const titlebarCloseHandler = async () => {
      await appWindow.close();
    };
    if (titleBarClose.current && maximizeBtn.current && minimizeBtn.current) {
      minimizeBtn.current.addEventListener("click", titlebarMinimizeHandler);
      maximizeBtn.current.addEventListener("click", titlebarMaximizeHandler);
      titleBarClose.current.addEventListener("click", titlebarCloseHandler);
    }
    return () => {
      minimizeBtn.current &&
        minimizeBtn.current.removeEventListener(
          "click",
          titlebarMinimizeHandler
        );
      maximizeBtn.current &&
        maximizeBtn.current.removeEventListener(
          "click",
          titlebarMaximizeHandler
        );
      titleBarClose.current &&
        titleBarClose.current.removeEventListener(
          "click",
          titlebarCloseHandler
        );
    };
  }, [minimizeBtn, maximizeBtn, titleBarClose]);

  return (
    <>
      <div
        data-tauri-drag-region
        className="h-7 bg-base-200 select-none flex justify-between fixed top-0 left-0 right-0"
      >
        <section className="w-fit ml-2 h-7 inline-flex justify-center items-center gap-x-1">
          <div className="h-5 w-5 object-cover">
            <img src={logo} alt="App Icon" />
          </div>
          <p>Segretino</p>
        </section>
        <section>
          <div
            className="btn_app_bar hover:bg-base-100 w-12"
            id="titlebar-minimize"
            ref={minimizeBtn}
          >
            <VscChromeMinimize />
          </div>
          <div
            className="btn_app_bar hover:bg-base-100 w-12"
            id="titlebar-maximize"
            ref={maximizeBtn}
            onClick={() => {
              setChangeIcon((p) => !p);
            }}
          >
            {changeIcon ? <VscChromeMaximize /> : <VscChromeRestore />}
          </div>
          <div
            className="btn_app_bar hover:bg-error hover:text-error-content w-12"
            id="titlebar-close"
            ref={titleBarClose}
          >
            <VscChromeClose />
          </div>
        </section>
      </div>
    </>
  );
};

export default TitleBar;

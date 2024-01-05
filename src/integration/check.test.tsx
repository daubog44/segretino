import { expect, test } from "vitest";
import { invoke } from "@tauri-apps/api";

describe("checks", () => {
  test("full app rendering/navigating", async () => {
    const spy = vi.spyOn(window, "__TAURI_IPC__");

    await invoke("close_splashscreen");

    expect(spy).toHaveBeenCalled();
    // mockIPC();
  });
});

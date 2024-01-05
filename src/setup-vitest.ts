import { mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import '@testing-library/jest-dom'
import { randomFillSync } from "crypto";

vi.mock('zustand')

beforeAll(() => {
    Object.defineProperty(window, 'crypto', {
        value: {
            // @ts-ignore      
            getRandomValues: (buffer) => {
                return randomFillSync(buffer);
            },
        },
    });

    mockIPC((cmd, args) => {
        switch (cmd) {
            case "close_splashscreen":
                return;
            case "get_env":
                if (args.env === "SUPABASE_PROJECT_ID") {
                    return process.env.SUPABASE_PROJECT_ID;
                } else if (args.env === "SUPABASE_URL") {
                    return process.env.SUPABASE_URL;
                }
        }
    });

    mockWindows("appWindow", "main", "splashscreen");
});
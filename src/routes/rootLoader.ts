import { initSupabase, useStore } from "@src/store";

export async function loader() {
    if (!useStore.getState().supabase)
        await initSupabase();
    return {};
}
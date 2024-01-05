import { initSupabase, useStore } from "../store";

export async function loader() {
    if (!useStore.getState().supabase)
        await initSupabase();
    return {};
}
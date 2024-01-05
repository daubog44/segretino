import { create } from 'zustand'
import { invoke } from "@tauri-apps/api/tauri";
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { immer } from 'zustand/middleware/immer';
import { Database } from './../../database.types'
import createSelectors from './createselectors';

interface State {
    supabase?: SupabaseClient;
}

type Actions = {
}

const createSupabaseClient = async () => {
    const url = await invoke("get_env", { env: "SUPABASE_URL" });
    const private_key = await invoke("get_env", { env: "SUPABASE_PROJECT_ID" });
    return createClient<Database>(url as string, private_key as string);
}

export const useStoreBase = create<State & Actions>()(immer((_set) => ({
})));

export const useStore = createSelectors(useStoreBase);

export const initSupabase = async () => {
    const supabaseInstance = await createSupabaseClient();
    useStore.setState(() => {
        return { supabase: supabaseInstance };
    });
}
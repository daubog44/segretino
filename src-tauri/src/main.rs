// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::Result;
use dotenv::dotenv;
use tauri;
use tauri::{Manager, Window};
use window_shadows::set_shadow;
use window_vibrancy::apply_blur;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

// const DATABASE_URL: &str =
//     "mysql://root:GMZNDEOIac2HUGMIUjD7@containers-us-west-144.railway.app:6248/railway";

struct MyState {}

impl MyState {
    fn new() -> Self {
        MyState {}
    }
}

#[tauri::command]
fn get_env(app_handle: tauri::AppHandle, env: String) -> String {
    let secret = std::env::var(env);
    match secret {
        Ok(s) => s,
        Err(_) => {
            app_handle.exit(1);
            "a".to_owned()
        }
    }
}

#[tauri::command]
async fn close_splashscreen(window: Window) {
    window
        .get_window("splashscreen")
        .expect("no window labeled 'splashscreen' found")
        .close()
        .unwrap();

    // Show main window
    let main_w = window
        .get_window("main")
        .expect("no window labeled 'main' found");
    set_shadow(&main_w, true).expect("error setting shdows");
    main_w.show().unwrap();
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}
fn main() -> Result<()> {
    dotenv()?;

    let state = MyState::new();

    let context = tauri::generate_context!();

    tauri::Builder::default()
        .setup(|app| {
            let splashscreen_window = app
                .get_window("splashscreen")
                .expect("no window labeled 'splashscreen' found");

            #[cfg(target_os = "macos")]
            apply_vibrancy(
                &splashscreen_window,
                NSVisualEffectMaterial::HudWindow,
                None,
                None,
            )
            .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            apply_blur(&splashscreen_window, Some((18, 18, 18, 125)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

            set_shadow(&splashscreen_window, true).expect("error setting shdows");

            let main_window = app.get_window("main").unwrap();

            main_window.hide().expect("Error setup app!");
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                main_window.open_devtools();
            }
            Ok(())
        })
        .manage(state)
        .invoke_handler(tauri::generate_handler![get_env, close_splashscreen])
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);

            app.emit_all("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .run(context)
        .expect("error while running tauri application");
    Ok(())
}

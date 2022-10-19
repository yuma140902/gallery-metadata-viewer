#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{borrow::Cow, path::PathBuf};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_json(file: &str) -> Result<String, String> {
    let path = PathBuf::from(file);
    let path = if path
        .extension()
        .map(|s| s.to_string_lossy())
        .unwrap_or_else(|| Cow::Borrowed(""))
        != "json"
    {
        file.to_owned() + ".json"
    } else {
        file.to_owned()
    };
    match std::fs::read_to_string(path) {
        Ok(json) => Ok(json),
        Err(e) => Err(format!("{:?}", e)),
    }
}

fn main() {
    eprintln!("args: {:?}", std::env::args());
    tauri::Builder::default()
        .setup(|app| {
            match app.get_cli_matches() {
                Ok(matches) => {
                    println!("{:?}", matches)
                }
                Err(e) => {
                    eprintln!("{:?}", e);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_json])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

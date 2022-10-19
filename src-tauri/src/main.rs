#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    borrow::Cow,
    ffi::OsString,
    io,
    path::{Path, PathBuf},
};
use windows::{
    core::PCWSTR,
    Win32::UI::Shell::{ILCreateFromPathW, SHOpenFolderAndSelectItems},
};

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

fn to_wide_chars(s: &str) -> Vec<u16> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    OsStr::new(s)
        .encode_wide()
        .chain(Some(0).into_iter())
        .collect::<Vec<_>>()
}

#[tauri::command]
fn open_parent_directory(file: &str) -> Result<(), String> {
    unsafe {
        let pidl = ILCreateFromPathW(PCWSTR(to_wide_chars(file).as_ptr()));
        SHOpenFolderAndSelectItems(pidl, None, 0).map_err(|e| e.message().to_string_lossy())?;
    }
    Ok(())
}

#[tauri::command]
fn open_file(file: &str) -> Result<(), String> {
    open::that(PathBuf::from(file)).map_err(|e| format!("{:?}", e))
}

#[tauri::command]
fn next_file(file: &str) -> Result<String, String> {
    let path = PathBuf::from(file);
    let parent = path.parent().ok_or_else(|| "no parent directory")?;
    let next_path = next_file_io(path.as_path(), parent).map_err(|e| format!("{:?}", e))?;
    match next_path {
        Some(next_path) => Ok(next_path.to_string_lossy().to_owned().to_string()),
        None => Err("no next file".to_owned()),
    }
}

fn next_file_io(orig_path: &Path, parent: &Path) -> io::Result<Option<PathBuf>> {
    let mut next = false;
    for entry in std::fs::read_dir(parent)? {
        let entry = entry?;
        let path = entry.path();
        if next && path.extension() != Some(&OsString::from("json")) {
            return Ok(Some(path.clone()));
        }
        if path.is_file() && path == orig_path {
            next = true;
        }
    }
    Ok(None)
}

#[tauri::command]
fn prev_file(file: &str) -> Result<String, String> {
    let path = PathBuf::from(file);
    let parent = path.parent().ok_or_else(|| "no parent directory")?;
    let prev_path = prev_file_io(path.as_path(), parent).map_err(|e| format!("{:?}", e))?;
    match prev_path {
        Some(prev_path) => Ok(prev_path.to_string_lossy().to_owned().to_string()),
        None => Err("no prev file".to_owned()),
    }
}

fn prev_file_io(orig_path: &Path, parent: &Path) -> io::Result<Option<PathBuf>> {
    let mut prev_path = orig_path.to_path_buf();
    for entry in std::fs::read_dir(parent)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_file() && path == orig_path {
            return Ok(Some(prev_path));
        }
        if path.extension() != Some(&OsString::from("json")) {
            prev_path = path.clone();
        }
    }
    Ok(None)
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
        .invoke_handler(tauri::generate_handler![
            get_json,
            open_parent_directory,
            open_file,
            next_file,
            prev_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

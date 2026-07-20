mod mpv_ipc;

#[tauri::command]
fn launch_mpv(url: String, args: Vec<String>) -> Result<(), String> {
    std::process::Command::new("mpv")
        .arg(url)
        .args(args)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            launch_mpv,
            mpv_ipc::start_mpv_monitor,
            mpv_ipc::set_mpv_pause,
            mpv_ipc::set_mpv_time,
            mpv_ipc::set_mpv_playlist_pos
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use tauri::Emitter;
use std::io::{Read, Write};
#[cfg(unix)]
use std::os::unix::net::UnixStream;
#[cfg(windows)]
use std::fs::OpenOptions;
use std::time::Duration;

fn send_mpv_command(socket_path: &str, command: serde_json::Value) -> Result<(), String> {
    let mut payload = command.to_string();
    payload.push('\n');

    #[cfg(unix)]
    {
        let mut stream = UnixStream::connect(socket_path).map_err(|e| e.to_string())?;
        stream.write_all(payload.as_bytes()).map_err(|e| e.to_string())?;
    }

    #[cfg(windows)]
    {
        let mut file = OpenOptions::new()
            .write(true)
            .open(socket_path)
            .map_err(|e| e.to_string())?;
        file.write_all(payload.as_bytes()).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn set_mpv_pause(socket_path: String, pause: bool) -> Result<(), String> {
    let cmd = serde_json::json!({
        "command": ["set_property", "pause", pause]
    });
    send_mpv_command(&socket_path, cmd)
}

#[tauri::command]
pub fn set_mpv_time(socket_path: String, seconds: f64) -> Result<(), String> {
    let cmd = serde_json::json!({
        "command": ["seek", seconds, "absolute"]
    });
    send_mpv_command(&socket_path, cmd)
}

fn query_mpv(socket_path: &str, command: serde_json::Value) -> Result<String, String> {
    let mut payload = command.to_string();
    payload.push('\n');

    #[cfg(unix)]
    {
        let mut stream = UnixStream::connect(socket_path).map_err(|e| e.to_string())?;
        stream.set_read_timeout(Some(Duration::from_millis(250))).map_err(|e| e.to_string())?;
        stream.write_all(payload.as_bytes()).map_err(|e| e.to_string())?;

        let mut response = String::new();
        
        let mut buffer = [0; 4096];
        let bytes_read = stream.read(&mut buffer).map_err(|e| e.to_string())?;
        let response = String::from_utf8_lossy(&buffer[..bytes_read]).into_owned();
        
        if response.is_empty() {
            return Err("Пустой ответ от сокета".to_string());
        }
        Ok(response)
    }

    #[cfg(windows)]
    {
        let mut file = OpenOptions::new()
            .read(true)
            .write(true)
            .open(socket_path)
            .map_err(|e| e.to_string())?;
        file.write_all(payload.as_bytes()).map_err(|e| e.to_string())?;

        let mut response = String::new();
        file.read_to_string(&mut response).map_err(|e| e.to_string())?;
        Ok(response)
    }
}

#[tauri::command]
pub fn start_mpv_monitor(window: tauri::Window, socket_path: String) {
    std::thread::spawn(move || {
        let mut last_time = 0.0;
        let mut last_pause = false;

        let query_time_cmd = serde_json::json!({"command": ["get_property", "time-pos"]});
        let query_pause_cmd = serde_json::json!({"command": ["get_property", "pause"]});

        println!("[Rust Monitor]: Начинаем проверку сокета: {}", socket_path);

        let mut socket_ready = false;
        for i in 1..=40 {
            if std::path::Path::new(&socket_path).exists() {
                if query_mpv(&socket_path, serde_json::json!({"command": ["client_name"]})).is_ok() {
                    socket_ready = true;
                    println!("[Rust Monitor]: Плеер успешно ответил на попытке №{}! Поток мониторинга запущен.", i);
                    break;
                }
            }
            std::thread::sleep(Duration::from_millis(500));
        }

        if !socket_ready {
            println!("[Rust Monitor Error]: Тайм-аут (20 секунд). Плеер не ответил в сокет. Мониторинг отменен.");
            return;
        }

        println!("[Rust Monitor]: Запуск отслеживания состояния.");

        let mut error_count = 0;

        loop {
            let time_res = query_mpv(&socket_path, query_time_cmd.clone());
            let pause_res = query_mpv(&socket_path, query_pause_cmd.clone());

            if time_res.is_err() || pause_res.is_err() {
                error_count += 1;
                
                if error_count >= 8 {
                    println!("[Rust Monitor]: Плеер действительно закрылся (8 ошибок подряд). Стоп мониторинг.");
                    break;
                }

                std::thread::sleep(Duration::from_millis(500));
                continue;
            }

            error_count = 0;

            let time_str = time_res.unwrap();
            let current_time: f64 = serde_json::from_str::<serde_json::Value>(&time_str)
                .map(|v| v["data"].as_f64().unwrap_or(0.0))
                .unwrap_or(0.0);

            let pause_str = pause_res.unwrap();
            let current_pause: bool = serde_json::from_str::<serde_json::Value>(&pause_str)
                .map(|v| v["data"].as_bool().unwrap_or(false))
                .unwrap_or(false);

            let is_playing = !current_pause;
            let time_diff = (current_time - last_time).abs();
            
            let pause_changed = current_pause != last_pause;
            
            let user_seeked = is_playing && !pause_changed && time_diff > 4.0;
            
            if pause_changed || user_seeked {
                println!("[Rust Monitor] Валидное действие! Playing: {}, Time: {}", is_playing, current_time);
                
                let payload = serde_json::json!({
                    "isPlaying": is_playing,
                    "currentTime": current_time
                });
                
                let _ = window.emit("mpv_state_changed", payload);
                last_pause = current_pause;
            }

            last_time = current_time; 
            std::thread::sleep(Duration::from_millis(500));
        }
    });
}

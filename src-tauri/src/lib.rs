mod adb;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            // Connection
            adb::adb_devices,
            adb::adb_connect,
            adb::adb_disconnect,
            adb::scan_network,
            adb::get_local_subnet,
            // Packages
            adb::adb_list_packages,
            adb::adb_uninstall,
            adb::adb_install,
            adb::adb_force_stop,
            adb::adb_clear_data,
            // Device Info
            adb::adb_device_info,
            // Remote Control
            adb::adb_keyevent,
            adb::adb_text_input,
            // Screenshot
            adb::adb_screenshot,
            adb::adb_screenshot_save,
            // File Manager
            adb::adb_ls,
            adb::adb_pull,
            adb::adb_push,
            adb::adb_delete,
            // Shell
            adb::adb_shell_exec,
            // Reboot
            adb::adb_reboot,
            // Logcat
            adb::adb_logcat,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

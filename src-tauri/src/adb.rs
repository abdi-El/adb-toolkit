use std::net::IpAddr;

use base64::Engine;
use serde::Serialize;
use tauri_plugin_shell::ShellExt;
use tokio::net::TcpStream;
use tokio::time::{timeout, Duration};

// ── Structs ──────────────────────────────────────────────────────────

#[derive(Serialize, Clone)]
pub struct AdbDevice {
    pub address: String,
    pub status: String,
    pub info: String,
}

#[derive(Serialize, Clone)]
pub struct DiscoveredDevice {
    pub ip: String,
    pub port: u16,
}

#[derive(Serialize, Clone)]
pub struct DeviceInfo {
    pub model: String,
    pub manufacturer: String,
    pub android_version: String,
    pub sdk_version: String,
    pub device_name: String,
    pub serial: String,
    pub resolution: String,
    pub ip_address: String,
    pub total_storage: String,
    pub available_storage: String,
}

#[derive(Serialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub is_dir: bool,
    pub size: String,
    pub permissions: String,
    pub modified: String,
}

// ── Helper ───────────────────────────────────────────────────────────

async fn run_adb(app: &tauri::AppHandle, args: &[&str]) -> Result<(String, String), String> {
    let output = app
        .shell()
        .sidecar("adb-toolkit-adb")
        .map_err(|e| e.to_string())?
        .args(args)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    Ok((stdout, stderr))
}

async fn shell_cmd(app: &tauri::AppHandle, address: &str, cmd: &str) -> Result<String, String> {
    let (stdout, _) = run_adb(app, &["-s", address, "shell", cmd]).await?;
    Ok(stdout)
}

fn get_prop(props: &str, key: &str) -> String {
    props
        .lines()
        .find(|l| l.contains(key))
        .and_then(|l| l.split(": [").nth(1))
        .map(|v| v.trim_end_matches(']').to_string())
        .unwrap_or_default()
}

// ── Connection Management ────────────────────────────────────────────

#[tauri::command]
pub async fn adb_devices(app: tauri::AppHandle) -> Result<Vec<AdbDevice>, String> {
    let (stdout, _) = run_adb(&app, &["devices", "-l"]).await?;
    Ok(parse_adb_devices(&stdout))
}

#[tauri::command]
pub async fn adb_connect(app: tauri::AppHandle, address: String) -> Result<String, String> {
    let (stdout, stderr) = run_adb(&app, &["connect", &address]).await?;
    if !stderr.is_empty() && stdout.is_empty() {
        Err(stderr)
    } else {
        Ok(stdout)
    }
}

#[tauri::command]
pub async fn adb_disconnect(app: tauri::AppHandle, address: String) -> Result<String, String> {
    let (stdout, _) = run_adb(&app, &["disconnect", &address]).await?;
    Ok(stdout)
}

#[tauri::command]
pub async fn scan_network(subnet: String) -> Result<Vec<DiscoveredDevice>, String> {
    let mut handles = Vec::new();

    for i in 1..=254 {
        let ip = format!("{}.{}", subnet, i);
        handles.push(tokio::spawn(async move {
            let addr = format!("{}:5555", ip);
            let reachable = timeout(Duration::from_millis(500), TcpStream::connect(&addr))
                .await
                .map(|r| r.is_ok())
                .unwrap_or(false);

            if reachable {
                Some(DiscoveredDevice { ip, port: 5555 })
            } else {
                None
            }
        }));
    }

    let mut devices = Vec::new();
    for handle in handles {
        if let Ok(Some(device)) = handle.await {
            devices.push(device);
        }
    }
    Ok(devices)
}

#[tauri::command]
pub fn get_local_subnet() -> Result<String, String> {
    let ip = local_ip_address::local_ip().map_err(|e| e.to_string())?;
    if let IpAddr::V4(ipv4) = ip {
        let octets = ipv4.octets();
        Ok(format!("{}.{}.{}", octets[0], octets[1], octets[2]))
    } else {
        Err("IPv6 not supported for scanning".to_string())
    }
}

// ── Package Management ───────────────────────────────────────────────

#[tauri::command]
pub async fn adb_list_packages(
    app: tauri::AppHandle,
    address: String,
) -> Result<Vec<String>, String> {
    let (stdout, _) = run_adb(&app, &["-s", &address, "shell", "pm", "list", "packages", "-3"]).await?;
    let packages = stdout
        .lines()
        .filter_map(|line| line.strip_prefix("package:"))
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();
    Ok(packages)
}

#[tauri::command]
pub async fn adb_uninstall(
    app: tauri::AppHandle,
    address: String,
    package: String,
) -> Result<String, String> {
    let (stdout, stderr) = run_adb(&app, &["-s", &address, "uninstall", &package]).await?;
    if stdout.contains("Success") {
        Ok(stdout)
    } else {
        Err(if stderr.is_empty() { stdout } else { stderr })
    }
}

#[tauri::command]
pub async fn adb_install(
    app: tauri::AppHandle,
    address: String,
    apk_path: String,
) -> Result<String, String> {
    let (stdout, stderr) = run_adb(&app, &["-s", &address, "install", "-r", &apk_path]).await?;
    if stdout.contains("Success") {
        Ok(stdout)
    } else {
        Err(if stderr.is_empty() { stdout } else { stderr })
    }
}

#[tauri::command]
pub async fn adb_force_stop(
    app: tauri::AppHandle,
    address: String,
    package: String,
) -> Result<String, String> {
    shell_cmd(&app, &address, &format!("am force-stop {package}")).await
}

#[tauri::command]
pub async fn adb_clear_data(
    app: tauri::AppHandle,
    address: String,
    package: String,
) -> Result<String, String> {
    shell_cmd(&app, &address, &format!("pm clear {package}")).await
}

// ── Device Info ──────────────────────────────────────────────────────

#[tauri::command]
pub async fn adb_device_info(
    app: tauri::AppHandle,
    address: String,
) -> Result<DeviceInfo, String> {
    let props = shell_cmd(&app, &address, "getprop").await?;
    let resolution = shell_cmd(&app, &address, "wm size").await?;
    let df = shell_cmd(&app, &address, "df /data").await?;
    let ip_out = shell_cmd(&app, &address, "ip route").await?;

    let res = resolution
        .lines()
        .last()
        .unwrap_or("")
        .replace("Physical size: ", "")
        .replace("Override size: ", "")
        .trim()
        .to_string();

    let (total_storage, available_storage) = parse_df(&df);

    let ip_address = ip_out
        .lines()
        .find(|l| l.contains("src"))
        .and_then(|l| l.split("src ").nth(1))
        .map(|s| s.split_whitespace().next().unwrap_or("").to_string())
        .unwrap_or_default();

    Ok(DeviceInfo {
        model: get_prop(&props, "ro.product.model"),
        manufacturer: get_prop(&props, "ro.product.manufacturer"),
        android_version: get_prop(&props, "ro.build.version.release"),
        sdk_version: get_prop(&props, "ro.build.version.sdk"),
        device_name: get_prop(&props, "ro.product.device"),
        serial: get_prop(&props, "ro.serialno"),
        resolution: res,
        ip_address,
        total_storage,
        available_storage,
    })
}

fn parse_df(df: &str) -> (String, String) {
    let line = df.lines().nth(1).unwrap_or("");
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.len() >= 4 {
        (format_size(parts[1]), format_size(parts[3]))
    } else {
        (String::new(), String::new())
    }
}

fn format_size(kb_str: &str) -> String {
    let kb: f64 = kb_str.replace("K", "").parse().unwrap_or(0.0);
    if kb > 1_000_000.0 {
        format!("{:.1} GB", kb / 1_048_576.0)
    } else if kb > 1000.0 {
        format!("{:.1} MB", kb / 1024.0)
    } else {
        format!("{} KB", kb_str)
    }
}

// ── Remote Control ───────────────────────────────────────────────────

#[tauri::command]
pub async fn adb_keyevent(
    app: tauri::AppHandle,
    address: String,
    keycode: u32,
) -> Result<(), String> {
    shell_cmd(&app, &address, &format!("input keyevent {keycode}")).await?;
    Ok(())
}

#[tauri::command]
pub async fn adb_text_input(
    app: tauri::AppHandle,
    address: String,
    text: String,
) -> Result<(), String> {
    let escaped = text.replace(' ', "%s");
    shell_cmd(&app, &address, &format!("input text '{escaped}'")).await?;
    Ok(())
}

// ── Screenshot ───────────────────────────────────────────────────────

#[tauri::command]
pub async fn adb_screenshot(
    app: tauri::AppHandle,
    address: String,
) -> Result<String, String> {
    let remote_path = "/sdcard/.adb-toolkit-screenshot.png";
    let local_path = std::env::temp_dir().join("adb-toolkit-screenshot.png");
    let local_str = local_path.to_string_lossy().to_string();

    // Capture on device
    shell_cmd(&app, &address, &format!("screencap -p {remote_path}")).await?;

    // Pull to local
    let (stdout, stderr) = run_adb(&app, &["-s", &address, "pull", remote_path, &local_str]).await?;
    if stderr.contains("error") && stdout.is_empty() {
        return Err(stderr);
    }

    // Clean up device file
    let _ = shell_cmd(&app, &address, &format!("rm {remote_path}")).await;

    // Read and encode
    let bytes = std::fs::read(&local_path).map_err(|e| e.to_string())?;
    if bytes.is_empty() {
        return Err("Empty screenshot data".to_string());
    }
    Ok(base64::engine::general_purpose::STANDARD.encode(&bytes))
}

#[tauri::command]
pub async fn adb_screenshot_save(
    screenshot_base64: String,
    save_path: String,
) -> Result<(), String> {
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(&screenshot_base64)
        .map_err(|e| e.to_string())?;
    std::fs::write(&save_path, &bytes).map_err(|e| e.to_string())?;
    Ok(())
}

// ── File Manager ─────────────────────────────────────────────────────

#[tauri::command]
pub async fn adb_ls(
    app: tauri::AppHandle,
    address: String,
    path: String,
) -> Result<Vec<FileEntry>, String> {
    let output = shell_cmd(&app, &address, &format!("ls -la {path}")).await?;
    Ok(parse_ls(&output))
}

#[tauri::command]
pub async fn adb_pull(
    app: tauri::AppHandle,
    address: String,
    remote_path: String,
    local_path: String,
) -> Result<String, String> {
    let (stdout, stderr) = run_adb(&app, &["-s", &address, "pull", &remote_path, &local_path]).await?;
    if stderr.contains("error") {
        Err(stderr)
    } else {
        Ok(if stdout.is_empty() { stderr } else { stdout })
    }
}

#[tauri::command]
pub async fn adb_push(
    app: tauri::AppHandle,
    address: String,
    local_path: String,
    remote_path: String,
) -> Result<String, String> {
    let (stdout, stderr) = run_adb(&app, &["-s", &address, "push", &local_path, &remote_path]).await?;
    if stderr.contains("error") {
        Err(stderr)
    } else {
        Ok(if stdout.is_empty() { stderr } else { stdout })
    }
}

#[tauri::command]
pub async fn adb_delete(
    app: tauri::AppHandle,
    address: String,
    path: String,
) -> Result<String, String> {
    shell_cmd(&app, &address, &format!("rm -rf '{path}'")).await
}

// ── Shell ────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn adb_shell_exec(
    app: tauri::AppHandle,
    address: String,
    command: String,
) -> Result<String, String> {
    let (stdout, stderr) = run_adb(&app, &["-s", &address, "shell", &command]).await?;
    Ok(if stdout.is_empty() { stderr } else { stdout })
}

// ── Reboot ───────────────────────────────────────────────────────────

#[tauri::command]
pub async fn adb_reboot(
    app: tauri::AppHandle,
    address: String,
    mode: String,
) -> Result<String, String> {
    let args: Vec<&str> = match mode.as_str() {
        "recovery" => vec!["-s", &address, "reboot", "recovery"],
        "bootloader" => vec!["-s", &address, "reboot", "bootloader"],
        _ => vec!["-s", &address, "reboot"],
    };
    let (stdout, _) = run_adb(&app, &args).await?;
    Ok(stdout)
}

// ── Logcat ───────────────────────────────────────────────────────────

#[tauri::command]
pub async fn adb_logcat(
    app: tauri::AppHandle,
    address: String,
    lines: u32,
) -> Result<String, String> {
    let count = lines.to_string();
    let (stdout, _) = run_adb(&app, &["-s", &address, "logcat", "-d", "-t", &count]).await?;
    Ok(stdout)
}

// ── Parsers ──────────────────────────────────────────────────────────

fn parse_adb_devices(output: &str) -> Vec<AdbDevice> {
    output
        .lines()
        .skip(1)
        .filter(|line| !line.trim().is_empty())
        .filter_map(|line| {
            let mut parts = line.split_whitespace();
            let address = parts.next()?.to_string();
            let status = parts.next()?.to_string();
            let info = parts.collect::<Vec<&str>>().join(" ");
            Some(AdbDevice {
                address,
                status,
                info,
            })
        })
        .collect()
}

fn parse_ls(output: &str) -> Vec<FileEntry> {
    output
        .lines()
        .filter(|l| !l.starts_with("total") && !l.trim().is_empty())
        .filter_map(|line| {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() < 7 {
                return None;
            }
            let permissions = parts[0].to_string();
            let is_dir = permissions.starts_with('d');
            let name = parts[7..].join(" ");
            if name == "." || name == ".." {
                return None;
            }
            let size = if is_dir {
                String::new()
            } else {
                parts[4].to_string()
            };
            let modified = if parts.len() > 6 {
                format!("{} {}", parts[5], parts[6])
            } else {
                String::new()
            };
            Some(FileEntry {
                name,
                is_dir,
                size,
                permissions,
                modified,
            })
        })
        .collect()
}

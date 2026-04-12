# ADB Toolkit

Desktop application for managing Android TV devices over ADB. Built with Tauri v2, React and Mantine UI.

## Features

- **Connection Manager** - View connected devices, scan the local network (port 5555), connect/disconnect manually or automatically
- **Remote Control** - Virtual D-pad, volume, media keys, power, and text input
- **App Manager** - List, install, bulk install, uninstall, force stop, and clear data for third-party apps
- **File Manager** - Browse device filesystem, upload and download files
- **Screenshot** - Capture the device screen and save to disk
- **Shell** - Execute ADB shell commands with history support
- **Logcat** - View device logs with filtering and auto-refresh
- **Device Info** - Model, manufacturer, Android version, storage, resolution, IP
- **Reboot** - Normal, Recovery, and Bootloader modes
- **Settings** - Language (EN, IT, ES, AR with RTL), dark/light theme, accent color picker

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) >= 1.88
- Tauri v2 system dependencies ([guide](https://v2.tauri.app/start/prerequisites/))

## Setup

```bash
# Install npm dependencies
make build

# Download ADB binary (pick your platform)
make fetch-adb-linux
# or
make fetch-adb-windows
```

If you already have ADB installed locally, you can copy it manually:

```bash
mkdir -p src-tauri/binaries
cp $(which adb) src-tauri/binaries/adb-x86_64-unknown-linux-gnu
```

## Development

```bash
make up
```

## Build

```bash
make dist
```

The installer will be generated in `src-tauri/target/release/bundle/`.

## Version Management

```bash
# Show current version
make version

# Bump version
make bump V=1.0.0
```

## Project Structure

```
src/                        # React frontend
  components/               # Reusable UI components
  pages/                    # Feature pages
  hooks/                    # Custom React hooks
  i18n/                     # Translations (EN, IT, ES, AR)
  types/                    # TypeScript interfaces

src-tauri/                  # Tauri / Rust backend
  src/adb.rs                # ADB command implementations
  src/lib.rs                # Command registration and plugin setup
  binaries/                 # ADB sidecar binary (not in git)
  capabilities/             # Tauri permission config
```

## Tech Stack

| Layer     | Technology                 |
| --------- | -------------------------- |
| Framework | Tauri v2                   |
| Frontend  | React 19, TypeScript, Vite |
| UI        | Mantine v9, Tabler Icons   |
| Backend   | Rust, tokio                |
| i18n      | i18next                    |
| ADB       | Bundled as Tauri sidecar   |

## License

MIT

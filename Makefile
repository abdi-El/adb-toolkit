.PHONY: up reset build dist bump version fetch-adb-linux fetch-adb-windows reset-store

build:
	npm install

up:
	npm run tauri dev

dist:
	npm run tauri build

version:
	@echo "Versione corrente: $$(grep -m1 '\"version\"' src-tauri/tauri.conf.json | grep -oP '[\d.]+')"

# Usage: make bump V=2.3.0
bump:
	@test -n "$(V)" || (echo "Specifica la versione: make bump V=x.y.z" && exit 1)
	@echo "Versione corrente: $$(grep -m1 '\"version\"' src-tauri/tauri.conf.json | grep -oP '[\d.]+')"
	@sed -i 's/"version": ".*"/"version": "$(V)"/' src-tauri/tauri.conf.json package.json
	@echo "Versione aggiornata a $(V)"

# Wipe Tauri plugin-store data (settings, onboarding flag) for testing first-launch flow.
# Identifier "adb-toolkit" from src-tauri/tauri.conf.json.
reset-store:
	@case "$$(uname -s)" in \
		Linux*)  DIR="$$HOME/.local/share/adb-toolkit" ;; \
		Darwin*) DIR="$$HOME/Library/Application Support/adb-toolkit" ;; \
		*) echo "Unsupported OS. Delete the app data dir for 'adb-toolkit' manually."; exit 1 ;; \
	esac; \
	if [ -f "$$DIR/settings.json" ]; then \
		rm -v "$$DIR/settings.json"; \
		echo "Store cleared."; \
	else \
		echo "No store found at $$DIR/settings.json — nothing to do."; \
	fi

fetch-adb-linux:
	mkdir -p src-tauri/binaries
	curl -L -o /tmp/platform-tools-linux.zip \
		https://dl.google.com/android/repository/platform-tools-latest-linux.zip
	unzip -o /tmp/platform-tools-linux.zip platform-tools/adb -d /tmp
	cp /tmp/platform-tools/adb src-tauri/binaries/adb-toolkit-adb-x86_64-unknown-linux-gnu
	chmod +x src-tauri/binaries/adb-toolkit-adb-x86_64-unknown-linux-gnu
	rm -rf /tmp/platform-tools /tmp/platform-tools-linux.zip
	@echo "ADB Linux binary ready"

fetch-adb-windows:
	mkdir -p src-tauri/binaries
	curl -L -o /tmp/platform-tools-windows.zip \
		https://dl.google.com/android/repository/platform-tools-latest-windows.zip
	unzip -o /tmp/platform-tools-windows.zip platform-tools/adb.exe platform-tools/AdbWinApi.dll platform-tools/AdbWinUsbApi.dll -d /tmp
	cp /tmp/platform-tools/adb.exe src-tauri/binaries/adb-toolkit-adb-x86_64-pc-windows-msvc.exe
	cp /tmp/platform-tools/AdbWinApi.dll src-tauri/binaries/
	cp /tmp/platform-tools/AdbWinUsbApi.dll src-tauri/binaries/
	rm -rf /tmp/platform-tools /tmp/platform-tools-windows.zip
	@echo "ADB Windows binary ready"
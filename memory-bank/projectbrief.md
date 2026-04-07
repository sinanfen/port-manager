# Project Brief

PortManager is a Windows-first desktop application for discovering active localhost ports, mapping them to processes, and giving developers a fast overview of what is running on their machine.

The initial milestone is a vertical MVP that proves the core scan-to-UI loop:

- Tauri v2 desktop shell
- Rust discovery layer for active TCP ports
- Best-effort process metadata lookup
- React UI with manual refresh, search, basic filters, and sorting

Out of scope for the first pass are tray behavior, process actions, settings UI, CLI, updater, packaging polish, and deep Docker/WSL support.


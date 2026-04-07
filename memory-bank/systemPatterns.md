# System Patterns

## Architecture

- Tauri v2 desktop app with a Rust backend and React/TypeScript frontend.
- Rust owns OS interaction, port discovery, process metadata lookup, settings persistence, and command exposure.
- React owns presentation, client-side filtering/sorting, and query-driven refresh state.

## Current implementation pattern

- Tauri commands provide normalized domain models to the UI.
- The first slice uses a shared `PortEntry` shape with camelCase serialization for frontend consistency.
- Discovery degrades gracefully: inaccessible or missing metadata should not fail the entire scan.
- UI state that represents controls and preferences lives in Zustand; fetched data lives in TanStack Query.
- Windows TCP sockets are discovered with `netstat2`, then enriched with `sysinfo` process data when available.
- Settings are stored as a JSON file in the user config directory and bootstrapped on app startup.
- The current UI is intentionally read-only: inspection first, actions later.
- A native Tauri tray icon is created at startup with close-to-tray behavior and a right-click utility menu.
- Tray menu actions are bridged back into the frontend with a Tauri app event for scan refresh.

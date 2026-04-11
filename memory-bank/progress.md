# Progress

## Current status

- Product direction is defined in `project-description.md`.
- Memory Bank core files have been normalized.
- The Tauri v2 + React/TypeScript application scaffold is in place.
- Windows-first TCP port discovery is implemented with best-effort process metadata lookup.
- The main UI supports manual refresh, search, filtering, sorting, and clear loading/empty/error states.
- Shared select and checkbox controls have been visually upgraded to match the desktop UI.
- A custom app icon set has been added and the desktop app now runs with a system tray icon, close-to-tray behavior, and a right-click tray menu.
- Browser, folder, terminal, and kill actions are implemented from the port list.
- GitHub release publishing is configured for Windows MSI builds, and local MSI bundling has been verified.
- Frontend tests, Rust unit tests, and a Tauri production build smoke check have all passed.

## Next milestones

1. Publish the first tagged GitHub Release and validate the public installer flow.
2. Add a settings screen on top of the JSON-backed settings service.
3. Add a process details view for deeper inspection.
4. Expand Windows edge-case handling and real-machine validation coverage.

# PortManager

PortManager is a Windows-first desktop app for inspecting active localhost ports, matching them to processes, and managing developer-facing local services from one place.

## Current milestone

This repository currently implements the initial vertical MVP:

- Tauri v2 desktop shell
- React + TypeScript frontend
- Rust-based TCP port discovery
- Best-effort process metadata lookup
- Search, filtering, sorting, and manual refresh

## Stack

- Tauri v2
- Rust
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- TanStack Query
- Vitest

## Local development

1. Install dependencies with `npm install`.
2. Run the web UI with `npm run dev`.
3. Run the desktop app with `npm run tauri:dev`.
4. Run checks with `npm run lint`, `npm run typecheck`, `npm run test:run`, and `cargo test --manifest-path src-tauri/Cargo.toml`.

## Notes

- The first implementation pass is Windows only.
- UI actions, tray behavior, CLI support, updater, packaging polish, WSL enrichment, and Docker enrichment are intentionally deferred.


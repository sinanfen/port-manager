# Tech Context

## Core stack

- Tauri v2
- Rust
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- TanStack Query
- Vitest

## Technical constraints

- Windows is the only supported implementation target in the current milestone.
- The repo started empty apart from the Memory Bank seed documents.
- Process metadata is best-effort and may be unavailable for protected or short-lived processes.
- `npm` is the active package manager for the frontend/tooling side.
- Rust discovery currently targets TCP sockets only, with the data model leaving room for UDP later.
- GitHub Actions is used for Windows release publishing, and the current public installer target is a WiX-based `.msi` bundle.
